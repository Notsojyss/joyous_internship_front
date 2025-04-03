<script>
import {useAuthStore} from "@/stores/authStore.js";
import {usePvpStore} from "@/stores/pvpStore.js";
import { computed, onMounted } from "vue";
import axios from 'axios';
import { ref } from "vue";
export default {
    name: "PvpBattle",
    setup() {
        const authStore = useAuthStore();
        const pvpStore = usePvpStore();
        const pvpbattles = computed(() => pvpStore.pvpbattles);
        const pvphistory = computed(() => pvpStore.pvphistory);
        const winMessage = computed(() => pvpStore.winMessage);
        const showWinMessage = computed(() => pvpStore.showWinMessage);


        onMounted(() => {
            pvpStore.fetchPvpBattles();


        });
        return {authStore, pvpStore, pvpbattles, winMessage, showWinMessage,pvphistory};
    },
    data() {
        return {
            showPickPlayModal: false,
            selectedPvpId: null,
            selectedPvpUsername: null,
            selectedPvpMoneybetted: null,
            showCreateBattleModal: false,
            selectedPlay: null, // Stores selected play
            selectedPvpIdHostPlay: null, // Stores selected play
            selectedBet: null,
            showHistory: false,
            hostPlay: null,
            hoveredPlay: null,  // Tracks hovered play
            playConfirmed: false, // Tracks if play is selected
            playImages : {
                Rock: "/src/assets/rock.png",
                Paper: "/src/assets/paper.png",
                Scissor: "/src/assets/scissor.png",
                Default: "/src/assets/questionmark.png",
            }
        }
    },
    computed: {
        user() {
            return this.authStore.user;
        },
        money(){
            return this.authStore.user?.money || 0;
        }
    },
    methods: {
        async handleJoin(user_id, pvpId, money_betted, username) {
            const canJoin = await this.checkUserisNotHost(user_id, pvpId);
            if (!canJoin) {
                alert("You cannot join your own battle.");
                return;
            }

            const hasEnoughMoney = await this.checkUserHasEnoughMoney(user_id, pvpId);
            if (!hasEnoughMoney) {
                alert("You do not have enough money to join this battle.");
                return;
            }
            this.selectedPvpMoneybetted =  money_betted;
            this.selectedPvpUsername = username;
            this.showPickPlayModal = true;
            this.selectedPvpId = pvpId;

            this.selectedPvpIdHostPlay = await this.pvpStore.fetchHostPlay(pvpId);
            console.log("Host Play:", this.selectedPvpIdHostPlay);

        },

        async checkUserisNotHost(   user_id, pvpId) {
            const battle = this.pvpStore.pvpbattles.find(battle => battle.id === pvpId);
            if (!battle) {
                console.warn("Battle not found.");
                return false; // Avoid joining a non-existent battle
            }
            return battle.host_id !== user_id;
        },

        async checkUserHasEnoughMoney(user_id, pvpId) {
            await this.authStore.fetchMoney(); // Ensure the latest data is fetched

            const battle = this.pvpStore.pvpbattles.find(battle => battle.id === pvpId);
            if (!battle) {
                console.warn("Battle not found.");
                return false;
            }

            if (!this.authStore.user || this.authStore.user.id !== user_id) {
                console.warn("User not found or ID mismatch.");
                return false;
            }

            console.log(`User Money: ${this.authStore.money}, Required Bet: ${battle.money_betted}`);

            return this.authStore.money >= battle.money_betted;
        }
        ,
        handleSelectPlay(play) {
            if (confirm(`Are you sure you want to select "${play}"?`)) {
                this.selectedPlay = this.selectedPvpIdHostPlay; // Store selected play for host
                this.playConfirmed = true;
                this.pvpStore.selectPlay(play, this.selectedPvpId);

            }
        },
         async handleClose() {
            await this.pvpStore.fetchPvpBattles();
            await this.authStore.fetchMoney();
             await this.pvpStore.clearWinMessage();
             this.showPickPlayModal = false;
             this.selectedPlay = null;
             this.hoveredPlay = null;
             this.playConfirmed = false;




        },
       async handleCreateBattle(play,money_betted) {
            if (!this.selectedPlay || !this.selectedBet) {
                alert("Please select both a play and a bet amount.");
                return;
            }
            console.log(`Creating battle with move: ${this.selectedPlay} and bet: ${this.selectedBet}`);
            this.pvpStore.createBattle(play,money_betted);
            await this.pvpStore.fetchPvpBattles();
            this.showCreateBattleModal = false;
           await this.authStore.fetchMoney();


        },
        async showHistoryModal(){

            this.showHistory = true;
            await this.pvpStore.fetchPvpHistory();
        },
        async closeHistoryModal(){

            this.showHistory = false;
        }


    }
}



</script>

<template>
    <div class="container">
        <h2 class="title">PVP BATTLES</h2>

        <button class="create-btn"  @click="showCreateBattleModal = true">Create Battle</button>
        <button class="history-btn" @click="showHistoryModal()"> ⓘ   History  </button>
        <div v-if="pvpbattles.length > 0" class="listing-grid">
            <div v-for="pvp in pvpbattles" :key="pvp.id" class="listing-card">
                <div class="listing-header">
                    <h2 class="host-name">Host: {{ pvp.username }}</h2>

                </div>
                <div>  <img src="../assets/pvpgame.png" alt="Market" class="nav-icon" /></div>
                <div class="listing-body">
                    <p class="wager">💰 Money Wager: <strong>{{ pvp.money_betted }}</strong></p>

                    <button class="join-btn" @click= "handleJoin(user.id,pvp.id,pvp.money_betted,pvp.username )">Join Battle</button>
                </div>
            </div>
        </div>
        <p v-else class="no-listing">No active listings available.</p>
    </div>


    <div v-if="showHistory" class="overlay-history">
        <div class="popup-history">
            <div class="popup-header">
                <h3>PVP BATTLES History</h3>
                <button class="show-history-close-btn" @click="closeHistoryModal()">Close</button>
            </div>

            <div class="market-history-loading" v-if="loading">Loading history...</div>

            <div v-else-if="pvphistory.length > 0" class="market-history-container">
                <table class="market-history-table">
                    <thead>
                    <tr>

                        <th>Host</th>
                        <th>Versus</th>
                        <th>Opponent</th>
                        <th>Bet</th>
                        <th>Winner</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="pvp in pvphistory" :key="pvp.id">
                        <td>{{ pvp.hostname }}</td>
                        <td>VS</td>
                        <td>{{ pvp.opponentname }}</td>
                        <td>{{ pvp.money_betted }}</td>
                        <td>{{ pvp.winnername }}</td>
                        <td>{{ pvp.battletime }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div v-else class="no-history-message">
                No history available.
            </div>
        </div>
    </div>









    <!--          Modal For Picking a Play opponents joining a Battle              -->
    <div v-if="showPickPlayModal" class="modal-overlay-bg">
        <div class="modal-pick-play">
            <div class="modal-pick-play-header">
                <h3>Select your Play:</h3>
                <button class="modal-play-close-btn" @click="handleClose()">Close</button>
            </div>

            <!-- Play Selection List -->
            <div class="play-selection-list">
                <!-- Host play image remains a question mark until play is selected -->
                <img class="hostplayimg" :src="playImages[selectedPlay || 'Default']" alt="Host Play" />

                <!-- Opponent play image changes on hover -->
                <img class="opponentplayimg" :src="hoveredPlay ? playImages[hoveredPlay] : playImages['Default']" alt="Opponent Play" />

                <p class="bet-text">Bet: {{ selectedPvpMoneybetted }}</p>
                <p class="pvpresult">{{ this.pvpStore.winMessage }}</p>

                <!-- Play Options -->
                <div v-if="!playConfirmed">
                    <button
                        @mouseover="hoveredPlay = 'Rock'"
                        @mouseleave="hoveredPlay = null"
                        @click="handleSelectPlay('Rock')"
                        class="play-option">
                        <img :src="playImages['Rock']" alt="Rock" />
                        <h3>Rock</h3>
                    </button>

                    <button
                        @mouseover="hoveredPlay = 'Paper'"
                        @mouseleave="hoveredPlay = null"
                        @click="handleSelectPlay('Paper')"
                        class="play-option">
                        <img :src="playImages['Paper']" alt="Paper" />
                        <h3>Paper</h3>
                    </button>

                    <button
                        @mouseover="hoveredPlay = 'Scissor'"
                        @mouseleave="hoveredPlay = null"
                        @click="handleSelectPlay('Scissor')"
                        class="play-option">
                        <img :src="playImages['Scissor']" alt="Scissors" />
                        <h3>Scissor</h3>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <p v-else hidden></p>



    <!-- Modal For Picking a Play & Bet (Create Battle) -->
    <div v-if="showCreateBattleModal" class="modal-create-battle">
        <div class="modal-create-battle-header">
            <h3>CREATING A PVP BATTLE </h3>
            <button class="modal-create-battle-close-btn" @click="showCreateBattleModal = false">Close</button>
        </div>

        <!-- Play Selection -->
        <div class="modal-create-battle-options">
            <button @click="selectedPlay = 'Rock'" class="play-option" :class="{ selected: selectedPlay === 'Rock' }">
                <img src="../assets/rock.png" alt="Rock" />
                <h3> Rock </h3>
            </button>
            <button @click="selectedPlay = 'Paper'" class="play-option" :class="{ selected: selectedPlay === 'Paper' }">
                <img src="../assets/paper.png" alt="Paper" />
                <h3> Paper </h3>
            </button>
            <button @click="selectedPlay = 'Scissor'" class="play-option" :class="{ selected: selectedPlay === 'Scissor' }">
                <img src="../assets/scissor.png" alt="Scissors" />
                <h3> Scissor </h3>
            </button>
        </div>

        <h3 class="bet-header">Select Your Bet:</h3>
        <!-- Bet Selection -->
        <div class="bet-selection-list">
            <button @click="selectedBet = 100" class="bet-option" :class="{ selected: selectedBet === 100 }">100</button>
            <button @click="selectedBet = 500" class="bet-option" :class="{ selected: selectedBet === 500 }">500</button>
            <button @click="selectedBet = 1000" class="bet-option" :class="{ selected: selectedBet === 1000 }">1000</button>
            <button @click="selectedBet = 2000" class="bet-option" :class="{ selected: selectedBet === 2000 }">2000</button>
        </div>

        <button class="confirm-btn-create" @click="handleCreateBattle(this.selectedPlay,this.selectedBet)">Confirm Battle</button>
    </div>


<!--    <div v-if="this.pvpStore.showWinMessage" class="win-message">-->
<!--        <p>{{ this.pvpStore.winMessage }}</p>-->
<!--        <button @click="handleMessage()">Close</button>-->
<!--    </div>-->

<!--  HISTORY MODAL FOR PVP BATTLES -->


</template>

<style scoped>
.modal-overlay-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7); /* Dark Transparent Background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
body.modal-open {
    overflow: hidden;
}
.modal-create-battle{
    position: fixed;
    top: 30%;
    left: 22.5%;
    border: black solid;
    border-radius: 12px;
    justify-content: center;
    background: linear-gradient(45deg, #373737 60%, #8f8f8f);
    max-height: 360px;
    min-height: 360px;
    min-width: 800px;
    max-width: 800px;
    display: flex;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
}
.modal-create-battle-header{
    position: fixed;
    margin-top: -300px;
    color: white;
}

.modal-create-battle-options{

    margin-left: 20px;

    display: flex;
    margin-top: -110px;
    justify-content: space-evenly;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    width: 1000px;


}

.bet-selection-list {
    display: flex;
    position: relative;
    justify-content: center;
    gap: 10px;
    top: 450px;

}

.bet-option {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: 1px solid #000;
    border-radius: 5px;
    transition: all 0.2s;
}

.bet-option:hover {
    background-color: #ddd;
}

.confirm-btn-create {
    display: block;
    position: fixed;
    top: 520px;
    left:760px ;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #28a745;
    color: white;
    border: none;
    width: 150px;
    border-radius: 5px;
    cursor: pointer;
}
.modal-create-battle-close-btn{
    display: block;
    position: fixed;
    top: 520px;
    left:600px ;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #fd0101;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: 150px;
}
.modal-pick-play{
    position: fixed;
    top: 25%;
    left: 22.5%;
    border: black solid;
    border-radius: 12px;
    justify-content: center;
    background: linear-gradient(45deg, #373737 60%, #8f8f8f);
    max-height: 450px;
    min-height: 450px;
    min-width: 800px;
    max-width: 800px;
    display: flex;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1001;
}

.modal-pick-play-header{
    position: fixed;
    margin-top: -410px;
    color: white;

}
.modal-play-close-btn{
    display: block;
    position: fixed;
    top: 580px;
    left:675px ;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #fd0101;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: 150px;

}
.hostplayimg{
    position: absolute;
    top: 50px;
    left: 130px;
    width: 150px;
    height: 150px;
    border: #cccccc 2px solid;
    border-radius: 10px;
    padding: 20px;
    background: rgba(39, 39, 39, 0.91);

}
.opponentplayimg{
    position: absolute;
    top: 50px;
    right: 130px;
    width: 150px;
    height: 150px;
    border: #cccccc 2px solid;
    border-radius: 10px;
    padding: 20px;
    background: rgba(39, 39, 39, 0.91);

}
.play-selection-list {

    margin-left: 20px;

    display: flex;
    margin-top: 150px;
    justify-content: space-evenly;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    width: 1000px;

}
.play-selection-list p{
     display: flex;
     position: fixed;
     justify-content: center;
     gap: 10px;
     margin-top: -100px;
    color: #ffffff;

 }
.bet-text{
    display: flex;
    position: absolute;
    justify-content: center;
    gap: 10px;
    top: 450px;
    color: #ffffff;
}
.play-option {
    position: relative;
    background: none;
    border: #aeabab 6px double;
    border-radius: 5px 5px 20px 20px;
    cursor: pointer;
    padding: 50px;
    height: 100px;
    width: 100px;
    color: white;
}
.play-option h3{
    position: absolute;
    text-align: center;
    left: 27px;
    width: 50px;
    top: 80px;


}

.play-option img {
    position: absolute;
    margin-top: -50px;
    padding: 5px;
    margin-left: -39px;
    justify-items: center;
    object-fit: cover ;
    width: 80px; /* Adjust size */
    height: 80px;
    transition: transform 0.2s ease-in-out;

}

.play-option img:hover {
    transform: scale(1.1);
}

.confirm-btn:hover {
    background-color: #218838;
}





    /* Main Container */
.container {
    text-align: center;
    background: transparent;
    padding: 20px;
    text-align: center;
    min-width: 1200px;
    margin-right: 125px;
    margin-top: 120px;
    border: #2c3e50 2px solid;
    max-height: 650px;
    min-height: 650px;
    max-width: 1200px;
}

/* Title */
.title {
    position: relative;
    font-size: 24px;
    color: #f5ff28;
    left: -450px;
    top: 0px;
    font-weight: bold;
    font-family: "Brush Script MT";
    font-size: 40px;
}

/* Grid layout for battles */
.listing-grid {
    display: grid;
    grid-template-columns: repeat(6, 4fr);
    gap: 10px;
    padding: 20px;
    position: relative;
    top:-40px;
    justify-items: center;
    max-width: 1160px;
    min-width: 1160px;
    overflow-x: hidden;
    overflow-y: auto;
    min-height: 500px;
    max-height: 500px;
}

/* Battle Card */
    .listing-card {
        background: linear-gradient(135deg, #222, #444);
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        color: white;
        transition: transform 0.2s ease-in-out;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 220px; /* Adjust size if needed */
        min-height: 240px;
        max-height: 240px;
    }

.listing-card:hover {
    transform: translateY(-5px);
}

/* Header */
.listing-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.nav-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

/* Battle Info */
.host-name {
    font-size: 18px;
    font-weight: bold;
}

.wager {
    font-size: 16px;
    margin: 10px 0;
}

/* Button */
.create-btn {
    background: #5de33f;
    position: relative;
    top: -50px;
    right: -450px;
    color: #222;
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    width: 120px;
    transition: background 0.2s;
    margin-right: 10px;
    margin-left: 10px;
}.history-btn {
    position: relative;
    top: -50px;
    right: -450px;
    background: transparent;
    font-weight: bold;
    color: #ffffff;
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    width: 120px;
    transition: background 0.2s;
    margin-right: 10px;
    margin-left: 10px;
}.history-btn:hover{
    transform: scale(105%);
    color:red;

}
.join-btn {
    background: #ffdb4d;

    color: #222;
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    width: 120px;
    transition: background 0.2s;
    margin-right: 10px;
    margin-left: 10px;
}

.join-btn:hover {
    background: #ffdb4d;

}

/* No Listings Message */
.no-listing {
    text-align: center;
    font-size: 18px;
    color: gray;
    margin-top: 20px;
}
.nav-icon{
    height: 60px;
    width: 120px;
    object-fit: contain;
}
.pvpresult {
    position: relative;
    top: 77%;
    left: 49%;
    transform: translate(-50%, -50%);
    color: #050505;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    font-family: "Brush Script MT";

}
/* Selected Play & Bet Highlight */
.selected {
    border: 2px solid green;
    background-color: lightgreen;
}
.bet-header {
    position: fixed;
    top:    430px;
    color: white;
}

/* Styling for Bet Selection */
.bet-selection-list {
    display: flex;
    position: fixed;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
}

.bet-option {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: 1px solid #000;
    border-radius: 5px;
    transition: all 0.2s;
}

.bet-option:hover {
    background-color: #ddd;
}
.overlay-history {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.popup-history {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    max-width: 800px;
    min-width: 800px;
    animation: fadeIn 0.3s ease-in-out;
    min-height: 400px;
    max-height: 400px;

}
.popup-header {
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    margin-bottom: 10px;
}
.show-history-close-btn {
    position: relative;
    top: 335px;
    right: 50px;
    background: red;
    color: white;
    border: none;
    padding: 5px 6px;
    cursor: pointer;
    border-radius: 5px;
}
.market-history-container{
    min-height:280px;
    max-height: 280px;
    overflow-x: hidden;
    overflow-y: auto;
}
.market-history-table {
    width: 100%;
    border-collapse: collapse;
    border: none;

}

.market-history-table th{
    position: sticky;
    top: 0;
    background: #f8f8f8;
    z-index: 10;
    padding: 10px;
    text-align: center;
    border-bottom: 2px solid #ddd;
}
.market-history-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    text-align: center;
    border: none;

}

.market-history-table th {
    background-color: #f4f4f4;
}
</style>

