<script>

export default {
    data() {
        return {
            form:{
                username: '',
                password: '',
                confirmPassword: '',
                full_name: '',
                first_name: '',
                last_name: '',
                email: '',
                confirmEmail: ''
            }

        };
    },
    methods: {
        async registerUser() {
            if (this.form.password !== this.form.confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            if (this.form.email !== this.form.confirmEmail) {
                alert("Emails do not match!");
                return;
            }
            try {
                const response = await fetch('http://joyous-internship-api-local.com/api/user/create/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.form)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                alert('User registered successfully!');
                console.log(data);
                this.$router.push('/loginform');
            } catch (error) {
                console.error('Registration failed:', error);
                alert('Failed to register user. Check console for details.');
            }
        }
    }
};
</script>

<template>

    <div class="forms">
        <img alt="Vue logo" class="logo" src="../../assets/LTlogo.png" width="200" height="140" />
        <h1>Register</h1>
        <input v-model="form.username" placeholder="Username" /><br>
        <input v-model="form.password" placeholder="Password" type="password"/><br>
        <input v-model="form.confirmPassword" placeholder="Confirm Password" type="password"/><br>
        <input v-model="form.full_name" placeholder="Full Name" /><br>
        <input v-model="form.first_name" placeholder="First Name" /><br>
        <input v-model="form.last_name" placeholder="Last Name" /><br>
        <input v-model="form.email" placeholder="Email" type="email"/><br>
        <input v-model="form.confirmEmail" placeholder="Confirm Email" type="email"/><br>

        <p class="login-link">
            Already have an account?
            <router-link class="logintxt" to="/loginform">Login</router-link>
        </p>
        <button @click = "registerUser">Register</button>

        <br><br>

    </div>
</template>

<style scoped>
.forms {
    position: absolute;
    top: 100px;
    left: 500px;
    width: 600px;
    height: 630px;
    padding: 20px;
    background: linear-gradient(45deg, #000000 60%, #8f8f8f);
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
}
.logo{
    position: relative;
    top: -20px;
}
.forms h1{
    position: relative;
    top:-40px;
}
.forms input {
    position: relative;
    top: -30px;
    width: 100%;
    padding: 10px;
    margin: 6px 0;
    border: 1px solid #ddd;
    height: 30px;
    border-radius: 5px;
    font-size: 16px;
    transition: 0.3s ease;
    background: #282828;
    color: white;
}

.forms input:focus {
    transform: scale(102%);
    box-shadow: 0 0 5px rgba(67, 124, 71, 0.5);
}

.forms button {
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    border: none;
    background: #494848;
    color: white;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.3s ease;
}

.forms button:hover {
    background: #ff0000;
}
.login-link{
    color: #8e918e;
    margin-top: -30px;
}
.logintxt{
    text-decoration: underline;
    color: white;
    font-weight: bold;
}.logintxt:hover{
     color: #ff0000;

 }
</style>
