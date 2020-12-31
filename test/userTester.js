const expect = require("chai").expect;

const LoginAndRegistration = require("../src/LoginAndRegistration")

describe("User Login and Registeration tests", () => {


    /**
     * TODO: add to this as you think of SQL shit
     * 
     * 
     * Registering a user must do the following:
     * 
     * Must add to the users table
     * 
     */
    describe("User Register", () => {
        it("Registers a user", () => {
            //do something
            LoginAndRegistration.registerUser();

            let query = "SELECT COUNT(*) FROM user WHERE username = ?"

            expect(out).to.equal("Success");

        })
    });

    describe("User Login", () => {
        it("Logs a user in", () => {
            let out = LoginAndRegistration.loginUser();

            expect(out).to.equal("Success");
        })
    });



})