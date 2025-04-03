<script>
import axios from "axios";
import {useAuthStore} from "@/stores/authStore.js";
import { computed, onMounted } from "vue";
import { ref } from "vue";
export default {
    name: "Market",
    setup() {
        const authStore = useAuthStore();
        const userItemsForSale = computed(() => authStore.userItemsForSale);
        const items = computed(() => authStore.items);
        const listings = computed(() => authStore.listings);
        const itemhistory = computed(() => authStore.itemhistory);
        const groupedListings = computed(() => authStore.groupedListings);
        const showItems = ref(false);
        onMounted(() => {
            authStore.fetchUserItemsForSale();
            authStore.fetchUserItems();
            authStore.fetchListings();
        });
        return { authStore,userItemsForSale,showItems,items,listings, groupedListings,itemhistory  };
    },
    data() {
        return {

            currentView: "buy",
            showModal: false,
            selectedItem: null,
            filteredListings: [],
            showSellModal: false,
            sellQuantity: 1,
            sellPrice: 0,
            showHistory: false,
            searchQuery: ""
        };
    },
    computed: {
        user() {
            return this.authStore.user;
        },
        filteredListings() {
            return this.listings.filter(listing =>
                this.selectedItem && listing.item_name === this.selectedItem.name
            )
        },
        filteredGroupedListings() {
            if (!this.searchQuery) return this.groupedListings;
            return this.groupedListings.filter(item =>
                item.item_name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },
        listingCounts() {
            const counts = {};
            this.listings.forEach(listing => {
                if (!counts[listing.item_id]) {
                    counts[listing.item_id] = 0;
                }
                counts[listing.item_id] += 1;
            });
            return counts;
        }
    },
    methods: {
        openSellModal(item) {
            this.selectedItem = item;
            this.sellQuantity = 1;
            this.sellPrice = 0;
            this.showSellModal = true;
        },
        handlePlaceClick() {
            this.authStore.fetchUserItems();
            this.showItems = true;
        },
        openModal(itemName, itemId) {
            this.selectedItem = { name: itemName, id: itemId }; // Store both item name and ID
            this.filteredListings = this.listings.filter(listing => listing.item_name === itemName);
            this.showModal = true;
            this.authStore.fetchListings();
        },

        closeModal() {
            this.showModal = false;
            this.selectedItem = null;
            this.filteredListings = [];
        },
        async showHistoryModal(){

          this.showHistory = true;
            await this.authStore.fetchItemHistory(this.selectedItem.id);
        },
        async closeHistoryModal(){

          this.showHistory = false;
        },

        async handleSellItem() {
            try {
                await this.authStore.sellItem(this.selectedItem.item_id, this.sellQuantity, this.sellPrice);
                this.showSellModal = false;
                this.showItems =false;
            } catch (error) {
                console.error("Error selling item:", error);
                alert("Failed to sell item.");
            }
        },
        async handleCurrentView(){
            this.currentView = 'buy';
            this.authStore.fetchListings();

        },
         async handleBuyItem (listing){
        try {
            await this.authStore.buyItem( {id: listing.id, quantity: listing.quantity, idType: 'listing_id'});
             await this.authStore.fetchListings();
           await this.authStore.fetchMoney();

            this.filteredListings = this.listings.filter(listing => listing.item_name === this.selectedItem.name);
        } catch (error) {
            console.error("Purchase failed:", error);
        }
        },

    }
};
</script>

<template>
    <div class="market-container">
        <h1>Market</h1>
        <div class="toggle-buttons">
            <button :class="{ active: currentView === 'buy' }" @click=this.handleCurrentView()>Buy</button>
            <button :class="{ active: currentView === 'sell' }" @click="currentView = 'sell'">Sell</button>
        </div>

        <!-- Buy View: Market Listings -->
        <div v-if="currentView === 'buy'">
            <h2>Market Listings</h2>
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Search for an item..."
                class="search-input"
            />
            <div v-if="filteredGroupedListings.length > 0" class="listing-grid">
                <div v-for="item in filteredGroupedListings" :key="item.item_name" class="listing-card">
                    <img :src="item.image" :alt="item.item_name" class="listing-image" />
                    <h3 class="itemListing">Available Listing {{ listingCounts[item.item_id] || 0 }}</h3>
                    <h3 class="itemNameH3">ITEM</h3>
                    <h2 class="itemNametext">{{ item.item_name }}</h2>
                    <button class="view-listing-btn" @click="openModal(item.item_name, item.item_id)">
                        View Listings
                    </button>
                </div>
            </div>
            <p v-else>No active listings available.</p>

        </div>

        <div v-if="currentView === 'sell'" class="sell-container">
            <h2>Sell Items</h2>

            <!-- Show items if they exist, otherwise show empty slots -->
            <div class="sell-grid">
                <div v-for="(item, index) in userItemsForSale" :key="index" class="sell-slot">
                    <img v-if="item.image" :src="item.image" alt="Item Image" class="item-image" />
                    <h3>{{ item.item_name }}</h3>
                    <p>Price: {{ item.price }}</p>
                    <p>Quantity: {{ item.quantity }}</p>

                    <!-- Cancel Button -->
                    <button @click="authStore.cancelListing(item.listing_id)" class="cancel-btn">Cancel</button>
                </div>

                <div
                    v-for="n in Math.max(4 - userItemsForSale.length, 0)"
                    :key="'empty-' + n"
                    class="sell-slot empty"
                >
                    <p>Empty</p>
                    <button @click="handlePlaceClick()">Place</button>
                </div>
            </div>

            <!-- Modal for selecting an item to sell -->
            <div v-if="showItems" class="modal-overlay" @click="showItems = false">
                <div class="modal-content-sell-list" @click.stop>
                    <div class = "modal-content-sell-list-header">
                        <h3>Select an Item to Sell:</h3>
                        <button class = "modal-content-sell-list-close-btn"@click="showItems = false">Close</button>
                    </div>
                    <div v-if="items.length > 0" class="item-list">
                        <div v-for="item in items" :key="item.id" class="item">
                            <img :src="item.image" :alt="item.item_name" class="item-image" />
                            <h3>{{ item.item_name }}</h3>
                            <div class="itemrarity">
                                <p>Rarity: {{ item.rarity }}</p>
                            </div>
                            <div class="qtytext">
                                <p><strong>Quantity: {{ item.quantity }}</strong></p>
                            </div>
                            <!-- Sell Button -->
                            <button @click="openSellModal(item)">Sell</button>
                        </div>
                    </div>
                    <p v-else>No items found.</p>
                </div>
            </div>

            <!-- Modal for entering quantity and price -->
            <div v-if="showSellModal" class="modal-overlay" @click="showSellModal = false">
                <div class="modal-content-sell-input" @click.stop>
                    <h3>Sell {{ selectedItem?.item_name }}</h3>
                    <label>Quantity:</label>
                    <input type="number" v-model="sellQuantity" :max="selectedItem?.quantity" min="1" />
                    <label>Price per Item:</label>
                    <input type="number" v-model="sellPrice" min="0.01" step="0.01" />
                    <button @click=handleSellItem()>Confirm Sell</button>
                    <button @click="showSellModal = false">Cancel</button>
                </div>
            </div>
        </div>



        <!-- Modal for Item Listings -->

        <div v-if="showModal" class="modal-overlay-item-listing">

            <div class="modal-content-buy-list">
                <div class = "modal-content-buy-list-header">
                    <h2>Listings for {{ selectedItem.name }}</h2>

                    <button class="close-btn" @click="closeModal">Close</button>
                    <button @click = "showHistoryModal()"> History </button>
                </div>

                <!-- History Overlay Pop-Up -->
                <div v-if="showHistory" class="overlay">
                    <div class="popup-history">
                        <div class="popup-header">
                            <h3>Item History</h3>
                            <button class="show-history-close-btn" @click="closeHistoryModal()">Close</button>
                        </div>

                        <div class="market-history-loading" v-if="loading">Loading history...</div>

                        <div v-else-if="itemhistory.length > 0" class="market-history-container">
                            <table class="market-history-table">
                                <thead>
                                <tr>

                                    <th>Item Name</th>
                                    <th>Price Per Item</th>
                                    <th>Quantity</th>
                                    <th>Sold on</th>
                                    <th>Username</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="history in itemhistory" :key="history.id">
                                    <td>{{ history.item_name }}</td>
                                    <td>{{ history["price per item"] }}</td>
                                    <td>{{ history.quantity }}</td>
                                    <td>{{ history.market_updated_at }}</td>
                                    <td>{{ history.username }}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <div v-else class="no-history-message">
                            No history available.
                        </div>
                    </div>
                </div>

                <div class="listings-container">
                    <div v-for="listing in filteredListings" :key="listing.id" class="listing-row">
                        <img :src="listing.image" :alt="listing.item_name" class="listing-image-small" />
                        <div class="listing-details">
                            <h3 class="listItemname">{{ listing.item_name }}</h3>
                            <p class="listRarity"><strong>Rarity:</strong> {{ listing.rarity }}</p>
                            <p class="listDescription">Description: {{ listing.description }}</p>
                            <p class="listQuantity"><strong>Quantity:</strong> {{ listing.quantity }}</p>
                            <p class="listPrice"><strong>Price:</strong> {{ listing.price * listing.quantity }} coins</p>
                            <p class="listSeller"><strong>Seller:</strong> {{ listing.username }}</p>
                            <button @click="handleBuyItem(listing)">Buy</button>
                        </div>
                    </div>
                </div>

                </div>

            </div>

        </div>

</template>
<style scoped>

.market-container {
    text-align: center;
    background-color: whitesmoke;
    padding: 20px;
    text-align: center;
    min-width: 1200px;
    margin-right: 125px;
    margin-top: 120px;
    border: #2c3e50 2px solid;
    //overflow-y: auto;
    //overflow-x: hidden;
    max-height: 650px;
    min-height: 650px;
    max-width: 1200px;
    background-color: whitesmoke;
}
.toggle-buttons {
    margin-bottom: 20px;
}
.toggle-buttons button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 15px;
    margin: 5px;
    cursor: pointer;
}
.toggle-buttons button.active {
    background-color: #2E7D32;
}
.sell-container {
    align-items: center;
    padding: 0;
    min-width: 1000px;
    min-height: 480px;
    justify-items: center;
    max-height: 480px;
    max-width: 1200px;
    overflow-y: auto;
    overflow-x: hidden;

}

.sell-grid {
    display: flex;
    flex-direction: column; /* Ensures items are stacked vertically */
    justify-items: center;
    gap: 10px; /* Adds spacing between items */
    min-width: 1000px;
    max-width: 1000px;
    max-height: 600px;
    min-height: auto;

}

.sell-slot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    text-align: center;
    min-height: 100px;
    max-height: 100px;
    width: 100%;

    //min-height: 100px;
    //max-height: 100px;
}

.item-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
}

button:hover {
    opacity: 0.9;
}
.modal-content-buy-list {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: fixed;
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    position: fixed;
    left: 160px;
    max-width: 1200px;
    min-width: 1200px;
    min-height: 520px;
    max-height: 520px;
    border: black solid 2px;
}

.modal-content-buy-list .close-btn{
    position: fixed;
    top: 600px;
    right: 725px;
}

.listing-grid {
    display: flex;
    flex-direction: column;
    gap: 5px;
    justify-content: start;
    min-height: 450px;
    max-height: 450px;
    overflow-y: auto;
    overflow-x: hidden;
    border: black solid 2px;

}
.view-listing-btn{
position: fixed;
    margin-top: -20px;

}

.listing-card {
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 5px;
    width: 1155px;
    text-align: center;
    border: black solid 2px;
    background-color: white;
    min-height: 100px;
    max-height: 100px;
}

.listing-image {
    position: relative;
    left: -500px;
    top: 0;
    width: 70px;
    height: 70px;
    border-radius: 5px;
}

button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}



.listings-container {
    flex-grow: 1;  /* Takes up remaining space */
    overflow-y: auto;
    overflow-x: hidden;/* Enables scrolling */
    min-height: 360px;
    max-height: 360px;
    padding: 10px;
}

.listing-row {
    display: flex;
    align-items: center;
    gap: 15px;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 5px;
    background: #f9f9f9;
    width: 100%;
    min-width: 0;
    min-height: 100px;
    max-height: 100px;

}

.listing-image-small {
    width: 80px;
    height: 80px;
    border-radius: 5px;
}

.listing-details {
    flex: 1;
    text-align: left;
    min-width: 0;
}

.close-btn {
    position: absolute;
    top: 0px;
    right: 30px;
    background-color: red;
    color: white;
    padding: 8px 12px;
    border: none;
    cursor: pointer;
    font-weight: bold;
}
.listing-card .itemNameH3 {
    position: relative;
    top: -115px;
    font-weight: bold;
}
.listing-card .itemListing {
    position: relative;
    top: -54px;
    right: -330px;
    font-size: 14px;
}
.listing-card .itemNametext {
    position: relative;
    top: -112px;
    font-weight: bold;
}
.listing-card button {
    position: relative;
    top: -143px;
    right: -500px;
    font-weight: bold;
}
.listing-details .listItemname{
    position: relative;
    text-align: center;
    top: 105px;
    right: 10px;
    width: 100px;


}
.listing-details .listRarity{
    position: relative;
    top: 65px;
    right: -95px;
    width: 100px;

}
.listing-details .listDescription{
    position: relative;
    text-align: center;
    top: 25px;
    right: -200px;
    width: 200px;
}
.listing-details .listQuantity{
    position: relative;
    top: -8px;
    right: -500px;
}.listing-details .listPrice{
     position: relative;
     top: -33px;
     right: -625px;
 }
.listing-details .listSeller{
    position: relative;
    top: -58px;
    right: -800px;
}
.listing-details button{
    position: relative;
    top: -85px;
    right: -950px;
}
.listing-row .listing-image-small{
    height: auto;
    max-width: 80px;

.sell-slot {
        width: 120px;
        height: 120px;
        border: 2px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f9f9f9;
    }
    .sell-grid {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
    }
}
.modal-overlay {
    position: fixed;
    top: 100px;
    margin:auto;
    max-height: 600px;
    min-height: 600px;
    min-width: 1200px;
    max-width: 1200px;


    display: flex;
    align-items: center;
    justify-items: center;
    overflow-y: auto;
    overflow-x: hidden;
}.modal-overlay-item-listing {
    position: fixed;
    top: 100px;
    right: 190px;

    max-height: 600px;
    min-height: 600px;
    min-width: 1200px;
    max-width: 1200px;

    display: flex;
    align-items: center;
    justify-items: center;


}
.modal-content-sell-list {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: fixed;
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    position: fixed;
    left: 160px;
    max-width: 1200px;
    min-width: 1200px;
    min-height: 520px;
    max-height: 520px;
    border: black solid 2px;

}
.modal-content-sell-list .modal-content-sell-list-close-btn{
    position: fixed;
    top: 600px;
    right: 725px;
}

.modal-content-sell-input{
    position: fixed;
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 50%;
    right:500px;
    max-width: 600px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
}

.item-list{
    flex-grow: 1;  /* Takes up remaining space */
    overflow-y: auto;
    overflow-x: hidden;/* Enables scrolling */
    min-height: 400px;  /* Ensures it fills the modal */
    max-height: 400px;  /* Ensures it fills the modal */
    padding: 10px;

}


/* Flex container for each item */
.item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 10px;
    border-bottom: 1px solid #ccc;

}

/* Item image styling */
.item-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 5px;
}



button {
    margin-top: 15px;
    padding: 8px 15px;
    background: #d9534f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background: #c9302c;
}

.overlay {
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
    position: fixed;

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
.market-history-container{
    min-height:280px;
    max-height: 280px;
    overflow-x: hidden;
    overflow-y: auto;
}
.market-history-table {
    width: 100%;
    border-collapse: collapse;

}

.market-history-table th, .market-history-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;


}

.market-history-table th {
    background-color: #f4f4f4;
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

.no-history-message {
    text-align: center;
    padding: 10px;
    color: #777;
}

/* Fade-in animation */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.search-input {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

</style>

