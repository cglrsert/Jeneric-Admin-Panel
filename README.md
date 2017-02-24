# Generic-Admin-Panel
Create Admin Panels Dynamically using AngularJS

# Build & development

Run 'npm i' to install node_moduls, then run 'bower i' to install bower_components.
Finally run 'grunt serve' for building.

NodeJS, Bower, Ruby, Grunt must be installed to run the app.

As a template, used Minovate.

# App Logic

The main logic of the application is in scripts/app.js. 
Firstly, you should create an object as in the data_example.json. This will be the 'data' variable in your app.js. 
All application is generated by this data. Data includes entities which have methods, fields and attributes.
App generates view, create, update, detail and delete html's using this data. You can use things as server-side pagination, filtering etc.. by setting true in object. To understand structure of object and rules of the app, send me e-mail.
