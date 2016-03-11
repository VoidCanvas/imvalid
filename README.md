# imvalid
This is a easy to use plugin to validate your JavaScript models (POJO). Check the examples to get an idea.

## Install the plugin
If you are using it in your node project you can run the *npm install* to get this plugin

	$ npm install imvalid

If you are not using it in node project than also you can install it through *npm* or get it from github repo and use the file *imvalid.js*


## Model design with imvalid

	var ValidationModel = require('imvalid'); //for client side use, you can autometically get this object in your global scope
	//inheriting Person from ValidationModel
	var Person = function (name,age) {
		ValidationModel.apply(this,arguments);
		this.name = name;
		this.age = age;
		this.email = null;
	};

	Person.prototype = Object.create(ValidationModel.prototype);

	Person.prototype.validations={
		name:{
			rules:['required'],
			controlName:"Name"
		},
		age:{
			rules:['number'],
			controlName:"Age"
		}
	}


	//inheriting adult from Person
	var Adult = function (name, age, email) {
		Person.apply(this,arguments);
		this.email = email;
	}

	Adult.prototype = Object.create(Person.prototype);

	Adult.prototype.validations={
		email:{
			rules:['required','customEmail'],
			customEmail:function (obj, email) {
				if(!email || email.length<6)
					return{
						code:1111,
						msg:"email should be longer than 6 char"
					}
			},
			controlName:"Email"
		}
	}


	//inheriting unknown person from Person
	var UnknownPerson = function (name, age, country) {
		Person.apply(this,arguments);
		this.foundIn = country;
	}

	UnknownPerson.prototype = Object.create(Person.prototype);

	UnknownPerson.prototype.validations={
		email:null, //removing the validation for email. Base class had it
		name:null, //removing the validation for name. Base class had it
		foundIn:{
			rules : ["required"],
			messages : ["Please provide @controlName"],
			controlName : "Found in country"
		}
	}


## Using this model

	var me = new Person("Paul");
	me.validate(); //validate me
	if(me.isValid){
		console.log("me is valid");
	}
	else{
		console.log("me is invalid");
		console.log(me.validationErrors); // this is an array of validation errors
	}


	var he = new UnknownPerson("Shan");
	he.validate(); //validate he
	if(he.isValid){
		console.log("he is valid");
	}
	else{
		console.log("he is invalid");
		console.log(he.validationErrors); // this is an array of validation errors
	}

