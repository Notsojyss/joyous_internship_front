<script>
import Leftheader from "@/components/Unnecessary/leftheader.vue";
import Rightheader from "@/components/Headers/rightheader.vue";
import { optionsjs } from "@/mixins/optionsjs.js";

export default {
    name: "OptionsAPI",
    components: { Rightheader, Leftheader },
    mixins: [optionsjs],
    props: {
        CompanyVersion: {
            type: String,
            default: "Common",
        }
    },
    data() {
        return {
            firstName: "",
            name: "",
            lastName: "",
            message: "Initializing...", // Default message
            namemessage: "Type your name above..."
        };
    },
    computed: {
        fullName() {
            return this.firstName.trim() && this.lastName.trim()
                ? this.firstName + " " + this.lastName
                : "Please enter both names";
        }
    },
    beforeCreate() {
        console.log("beforeCreate Hook: Data is NOT yet initialized.");
        console.log("message (beforeCreate):", this.message); // ❌ Undefined
    },
    created() { //happens before the component appears on the page
        // Runs before the DOM is ready
        console.log("Created Hook: Data is initialized, but DOM is not ready.");
        // ✅ You can access data
        this.message = "Created Hook Triggered!";
        // ❌ You cannot manipulate DOM elements yet (no this.$refs)
    },
    beforeMount() {
        console.log("beforeMount Hook: Template is compiled, but not yet in the DOM.");
        console.log("this.$el before mount:", this.$el);
    },
    mounted() {        //happens after the component is rendered on the page
        console.log("Mounted Hook: Component is now in the DOM.");
        console.log(this.$el);
        // ✅ You can now modify DOM elements
        this.$refs.box.style.backgroundColor = "lightblue";
    },
    watch: {
        name(newVal, oldVal) {
            this.namemessage = `Your name changed from ${oldVal} to ${newVal}`;
        }
    },
    methods :{
        changeMessage() {
            this.message = "Message Changed!";
        }
    }
};
</script>

<template>
    <div class="options"> OPTIONS API {{ CompanyVersion }}
        <button @click="viewList"> Alert </button>
    </div>

    <div class="forms">
        <input v-model="firstName" placeholder="First Name" />
        <input v-model="lastName" placeholder="Last Name" />
        <p>Full Name: {{ fullName }}</p>

        <br><br>

    </div>
    <div class="container">
        <h1>Vue Lifecycle: created() vs. mounted()</h1>

        <p><strong>Message:</strong> {{ message }}</p>

        <button @click="changeMessage">Change Message</button>

        <div ref="box" class="box">This box will change color on mounted()</div>

        <br>
        <br>
        <div>
            <input v-model="name" placeholder="Enter your name" />
            <p>{{ namemessage }}</p>
        </div>
    </div>

</template>

<style scoped>
.options {
    margin-top: 150px;
    margin-right: -100px;
}
.forms {
    margin-top: 50px;
    margin-right: -100px;
}
.example {
    font-weight: bold;
    padding: 10px;
}
.highlight {
    background-color: yellow;
}
</style>
