import { defineStore } from "pinia";
import axios from 'axios';
import { useAuthStore } from "@/stores/authStore";

export const usePvpStore = defineStore("pvp", {
    state: () => ({
        pvpbattles: [],
        pvphistory: [],
        winMessage: "",
        showWinMessage: false,
        leaderboard: [],

    }),
    actions: {
        async fetchPvpBattles() {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const apiUrl = "http://joyous-internship-api-local.com/api/pvp/get-pvpbattles"; // Ensure it's an absolute URL
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                console.log("Fetched PVP Battles:", response.data); // ✅ Debugging log
                this.pvpbattles = response.data;

            } catch (error) {
                console.error("Error fetching PVP battles:", error);
                if (error.response) {
                    console.error("Response Status:", error.response.status);
                    console.error("Response Data:", error.response.data);
                }
            }

        },
        async selectPlay(play, pvpId) {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const apiUrl = `http://joyous-internship-api-local.com/api/pvp/join-battle/${pvpId}`;
                const response = await axios.post(apiUrl,
                    {play: play},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    });
                if (response.data.message) {
                    this.winMessage = response.data.message;
                    this.showWinMessage = true;
                }


            } catch (error) {
                console.error("Error joining:", error);
            }
        },
        clearWinMessage() {
            this.winMessage = "";
            this.showWinMessage = false;

        },
        async createBattle(play, money_betted) {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const apiUrl = `http://joyous-internship-api-local.com/api/pvp/assignPlay`;
                const response = await axios.post(apiUrl,
                    {
                        play: play,
                        money_betted: money_betted
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    });
                this.fetchPvpBattles();
                alert("Battle created successfully:", response.data);
                console.log("Battle created successfully:", response.data);

            } catch (error) {
                console.error("Error creating battle:", error);
                if (error.response) {
                    console.error("Response Status:", error.response.status);
                    console.error("Response Data:", error.response.data);
                }
            }
        },
        async fetchHostPlay(pvpId) {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return null;
                }

                const apiUrl = `http://joyous-internship-api-local.com/api/pvp/get-HostPlay/${pvpId}`;
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                console.log("Fetched Host Play:", response.data.host_play);
                return response.data.host_play; // Directly return the value without storing it
            } catch (error) {
                console.error("Error fetching host play:", error);
                return null;
            }
        },
        async fetchPvpHistory() {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const apiUrl = "http://joyous-internship-api-local.com/api/pvp/getPvpHistory"; // Ensure it's an absolute URL
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                this.pvphistory = response.data;

            } catch (error) {
                console.error("Error fetching PVP History:", error);
                if (error.response) {
                    console.error("Response Status:", error.response.status);
                    console.error("Response Data:", error.response.data);
                }
            }

        },
        async fetchLeaderboard() {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const apiUrl = "http://joyous-internship-api-local.com/api/pvp/getLeaderboard";
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                this.leaderboard = response.data;
            } catch (error) {
                console.error("Error fetching leaderboard:", error);

                if (!error.response) {
                    console.error("Network error: Unable to reach the server.");
                    alert("Network error. Please check your internet connection.");
                    return;
                }

                const { status, data } = error.response;

                switch (status) {
                    case 404:
                        console.warn("Leaderboard not found.");
                        alert("Leaderboard data not found.");
                        break;
                    case 500:
                        console.error("Server error:", data);
                        alert("Something went wrong on the server. Please try again later.");
                        break;
                    default:
                        console.error("Unexpected error:", data);
                        alert(`Error: ${data.message || "An unexpected error occurred."}`);
                }
            }


        },

    }
});
