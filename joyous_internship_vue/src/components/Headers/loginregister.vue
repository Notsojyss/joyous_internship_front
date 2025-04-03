<script>
import { useAuthStore } from "@/stores/authStore.js";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import axios from 'axios'

export default {
    name: "loginregister",
    data() {
        return {
            authStore: useAuthStore(),
            router: useRouter()
        };
    },
    computed: {
        user() {
            return this.authStore.user;
        },
        money() {
            return this.authStore.money;
        }
    },
    methods: {
        handleLogout() {
            this.authStore.logout(this.router);
        }
    },
    mounted() {
        if (this.user) {
            this.authStore.fetchMoney(); // Fetch money when component is mounted
        }
    }
};
</script>


<template>
    <div>
        <div class="moneyVal">
            <a v-if="!user" hidden></a>
            <a v-else>
                <img alt="Coin Image" class="coin-icon" src="../../assets/coin.gif" width="40" height="40" /> Balance: {{ money }}
            </a>
        </div>



        <RouterLink v-if="!user" to="/loginform" class="btn login-btn">LOGIN</RouterLink>

        <button v-else class="btn login-btn">{{ user.full_name }}</button>

        <RouterLink v-if="!user" to="/registrationform" class="btn register-btn">REGISTER</RouterLink>
        <button v-else @click="handleLogout" class="btn register-btn">Logout</button>
    </div>
</template>



<style scoped>
.login-btn {
    background: #7b271a;
    text-align: center;
    color: #8e918e;
    padding-right: 10px;
    padding-left: 10px;
    font-family: "Brush Script MT";
    min-width: 80px;
    font-weight: bold;
    font-size: 16px;
    height: 30px;
    border-radius: 2px;
    cursor: pointer;
    transition: 0.3s;
    position: absolute;
    top: 23px;
    right: 145px;
}
.coin-icon{
    position: absolute;
    top: -7px;
    right: 100px;
}

.login-btn:hover {
    background: #da3a3a;
}
.register-btn {
    background: #7b271a;
    text-align: center;
    color: #8e918e;
    padding-right: 10px;
    padding-left: 10px;
    font-family: "Brush Script MT";
    min-width: 80px;
    font-weight: bold;
    font-size: 16px;
    height: 30px;
    border-radius: 2px;
    cursor: pointer;
    transition: 0.3s;
    position: absolute;
    top: 23px;
    right: 35px;
}

.register-btn:hover {
    background: #da3a3a;
}
.moneyVal{
    position: absolute;
    top: 27px;
    right: 300px;

}
.moneyVal a{
    font-weight: bold;
    color: #8e918e;
}

</style>
