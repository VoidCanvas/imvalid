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

Adult.prototype.customValidators = {
	customEmail:function (obj, email) {
		if(!email || email.length<6)
			return{
				code:1111,
				msg:"email should be longer than 6 char"
			}
	}
}
Adult.prototype.validations={
	email:{
		rules:['required','customEmail'],
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
	email:null,
	name:null,
	foundIn:{
		rules : ["required"],
		messages : ["Please provide @controlName"],
		controlName : "Found in country"
	}
}
