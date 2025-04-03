import { defineStore } from "pinia";
import { ref } from "vue";
import axios from 'axios'

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: JSON.parse(localStorage.getItem("user")) || null,
        money: 0,
        items: [],
        userItemsForSale: [],
        listings: [],
        groupedListings: [],
        itemhistory: [],
    }),
    actions: {
        login(userData, token) {
            this.user = userData;
            localStorage.setItem("auth_token", token);
            localStorage.setItem("user", JSON.stringify(userData));
        },
        async logout(router) { // Accept router as a parameter
            const confirmLogout = confirm("Are you sure you want to log out?");
            if (!confirmLogout) return;

            const token = localStorage.getItem("auth_token");

            if (!token) {
                alert("No active session found.");
                return;
            }

            try {

                const response = await fetch("http://joyous-internship-api-local.com/api/user/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Logout failed");
                }

                this.user = null;

                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
                console.log("Token successfully deleted from API.");
                alert("User has logged out.");
                console.log("User has logged out.");


                router.push("/loginform");

            } catch (error) {
                console.error("Logout error:", error);
                alert("Error logging out. Please try again.");
            }
        }
        ,
        checkLoginStatus() {
            const storedUser = localStorage.getItem("user");
            this.user = storedUser ? JSON.parse(storedUser) : null;
        },

        async fetchMoney() {
            try {
                const token = localStorage.getItem("auth_token");
                const response = await axios.get("http://joyous-internship-api-local.com/api/user/getMoney", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                 this.money = response.data.money;
                 console.log("Updated Money", this.money);
            } catch (error) {
                console.error("Error fetching money:", error.response?.data || error.message);
            }
        },
        async fetchUserItems() {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found.");
                    return;
                }

                const response = await axios.get("http://joyous-internship-api-local.com/api/user/getUsersitem", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.length > 0) {
                    this.items = response.data[0].items; // Assign fetched items
                } else {
                    this.items = [];
                }
            } catch (error) {
                console.error("Error fetching user items:", error);
            }
        },
        async fetchUserItemsForSale() {
            try {
                const token = localStorage.getItem("auth_token");

                if (!token) {
                    console.error("No authentication token found.");
                    return;
                }

                const response = await axios.get(
                    "http://joyous-internship-api-local.com/api/market/get-useritemforsale",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                this.userItemsForSale = response.data.filter(item => item.status === "active");

            } catch (error) {
                console.error("Error fetching user items for sale:", error);
            }
        },
        async sellItem(itemId, quantity, price) {
            try {
                const token = localStorage.getItem("auth_token");

                if (!token) {
                    console.error("No authentication token found.");
                    return;
                }

                const response = await axios.post(
                    "http://joyous-internship-api-local.com/api/market/sellitem",
                    {
                        item_id: itemId,
                        quantity: quantity,
                        price: price,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                alert(response.data.message);
                await this.fetchUserItems();
                await this.fetchUserItemsForSale();
            } catch (error) {
                console.error("Error selling item:", error.response?.data || error.message);
                alert(error.response?.data?.message || "Failed to sell item.");
            }
        },

        async cancelListing(listingId) {
            try {
                const confirmCancel = confirm("Are you sure you want to cancel?");
                if (!confirmCancel) return;
                const token = localStorage.getItem("auth_token");

                if (!token) {
                    console.error("No authentication token found.");
                    return;
                }

                const response = await axios.post(
                    "http://joyous-internship-api-local.com/api/market/cancelsellitem",
                    {
                        listing_id: listingId,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                alert(response.data.message);
                console.log("Successfully Cancelled Selling an Item")
                await this.fetchUserItems();
                await this.fetchListings();
                await this.fetchUserItemsForSale();
            } catch (error) {
                console.error("Error canceling listing:", error.response?.data || error.message);
                alert(error.response?.data?.message || "Failed to cancel listing.");
            }
        },
        async fetchListings() {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const response = await axios.get("http://joyous-internship-api-local.com/api/market/get-activelisting", {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
                });

                this.listings = response.data;
                this.groupListings();
            } catch (error) {
                console.error("Error fetching listings:", error);
            }
        },

        groupListings() {
            const uniqueItems = {};
            this.listings.forEach(listing => {
                if (!uniqueItems[listing.item_name]) {
                    uniqueItems[listing.item_name] = {
                        id: listing.id,
                        item_id: listing.item_id,
                        item_name: listing.item_name,
                        description: listing.description,
                        rarity: listing.rarity,
                        image: listing.image
                    };
                }
            });
            this.groupedListings = Object.values(uniqueItems);
        },
        async buyItem({ id, quantity, fromMarket = true, idType = "listing_id" }) {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }
                const requestData = {
                    [idType]: id,
                    quantity,
                    from_market: fromMarket,
                };
                const response = await axios.post(
                    "http://joyous-internship-api-local.com/api/buy-item",
                    requestData,
                    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
                );
                this.fetchListings();
                alert(response.data.message);
            } catch (error) {
                if (error.response.status === 400) {
                    alert(error.response.data.error); // Show "Not enough money"
                }else if (error.response.status === 401) {
                    alert("Unauthorized. Please log in.");
                } else if (error.response.status === 404) {
                    alert("Item or listing not found.");
                } else {
                    alert("An unexpected error occurred. Please try again.");
                }
                console.error("Error purchasing item:", error.response?.data || error.message);
            }
        },
        async fetchItemHistory(itemId) {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const response = await axios.get(`http://joyous-internship-api-local.com/api/market/get-itemhistory`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                    params: { item_id: itemId }
                });


                this.itemhistory = response.data; // Store fetched history
                console.log("Item History:", JSON.stringify(this.itemhistory, null, 2));


            } catch (error) {
                console.error("Error fetching item history:", error.response?.data || error.message);
            }
        },
    }
});
