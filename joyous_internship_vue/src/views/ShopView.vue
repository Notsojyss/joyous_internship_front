<script>
import axios from "axios";
import { useAuthStore } from "@/stores/authStore.js"; // Import Pinia store

export default {
    name: "ShopView",
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    data() {
        return {
            items: [],
            quantities: {} // Store quantities for each item
        };
    },
    computed: {
        user() {
            return this.authStore.user;
        }
    },
    mounted() {
        this.fetchItems();
    },
    methods: {
        async fetchItems() {
            try {
                const response = await axios.get(
                    "http://joyous-internship-api-local.com/api/item/get-shopitems"
                );
                this.items = response.data;

                // Initialize quantities for each item
                this.items.forEach(item => {
                    this.quantities[item.id] = 1;
                });
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        },

        increaseQuantity(itemId) {
            this.quantities[itemId]++;
        },

        decreaseQuantity(itemId) {
            if (this.quantities[itemId] > 1) {
                this.quantities[itemId]--;
            }
        },
        async handleBuyItemfromShop(item){
           await this.authStore.buyItem( {id: item.id, quantity: this.quantities[item.id], idType: 'item_id', fromMarket: false });
            await this.authStore.fetchMoney();


        }
    }

};
</script>


<template>
    <div class="shop-container">
        <h1 class="shop-title">Item Shop</h1>
        <div class="item-list">
            <div v-for="item in items" :key="item.id" class="item">
                <img :src="item.image" :alt="item.name" class="item-image" />
                <h4> <br />{{ item.item_name }}</h4>
                <p>Description: {{ item.description }}</p>
                <p><strong>Rarity:</strong> {{ item.rarity }}</p>
                <p><strong>Price:</strong> {{ item.price }}</p>

                <!-- Quantity Input -->
                <div class="quantity-container">
                    <button @click="decreaseQuantity(item.id)">-</button>
                    <input type="number" v-model="quantities[item.id]" min="1" disabled />
                    <button @click="increaseQuantity(item.id)">+</button>
                </div>

                <br />
                <button class="item-list-buy-btn" @click="handleBuyItemfromShop(item)">Buy</button>
            </div>
        </div>
    </div>
</template>


<style scoped>
.shop-container {
    padding: 20px;
    text-align: center;
    min-width: 1200px;
    margin-right: 125px;
    margin-top: 120px;
    border: #2c3e50 2px solid;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 650px;
    min-height: 650px;
    max-width: 1200px;
    background-color: whitesmoke;
}

.shop-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    margin-left: 20px;
}

.item-list {
    justify-items: center;
    margin-left: 20px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 250px;
    gap: 20px;
    width: 1100px;
}

.item {
    border: 2px solid black;
    padding: 8px;
    border-radius: 10px;
    width: 280px;
    text-align: center;
    background: #f9f9f9;

}


.item img {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    margin-bottom: -20px;
}

.item p {
    margin: 5px 0;
    font-size: 11px;
    height: auto;
}
 .item-list-buy-btn{
    position: relative;
    top: -20px;
     color: white;
     border: none;
     cursor: pointer;
     font-weight: bold;
     width: 60px;
     letter-spacing: 2px;
     padding: 6px 10px;
     background: #d9534f;
     border-radius: 4px;

}

 .quantity-container input{
    height: 20px;
     width: 50px;
     text-align: center;
     padding-left: 15px;
     background-color: transparent;
 }
</style>
