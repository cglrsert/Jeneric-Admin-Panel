'use strict';

var app = angular.module('adminService', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ngMessages',
    'picardy.fontawesome',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'ui.router',
    'ngMask',
    'ngValidate',
    'ui.utils',
    'angular-loading-bar',
    'angular-momentjs',
    'FBAngular',
    'lazyModel',
    'toastr',
    'angularBootstrapNavTree',
    'oc.lazyLoad',
    'ui.select',
    'ui.tree',
    'textAngular',
    'colorpicker.module',
    'angularFileUpload',
    'ngImgCrop',
    'datatables',
    'datatables.bootstrap',
    'datatables.colreorder',
    'datatables.buttons',
    'datatables.colvis',
    'datatables.tabletools',
    'datatables.scroller',
    'datatables.columnfilter',
    'datatables.light-columnfilter',
    'ui.grid',
    'ui.grid.resizeColumns',
    'ui.grid.edit',
    'ui.grid.moveColumns',
    'ngTable',
    'smart-table',
    'angular-flot',
    'angular-rickshaw',
    'easypiechart',
    'uiGmapgoogle-maps',
    'ui.calendar',
    'ngTagsInput',
    'pascalprecht.translate',
    'ngMaterial',
    'localytics.directives',
    'leaflet-directive',
    'wu.masonry',
    'ipsum',
    'angular-intro',
    'dragularModule'
])
.run(['$rootScope', '$state', '$stateParams','$templateCache','tokenService',function($rootScope, $state, $stateParams,$templateCache,tokenService) {
	$rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
	$rootScope.entityList = data.entities;

   	$rootScope.$on('$routeChangeStart', function(event, next, current) {

        $state.go($state.current.name, $state.params, { reload: true });

   });
	
	
	$rootScope.$on('$stateChangeSuccess', function(event, toState) {

    	event.targetScope.$watch('$viewContentLoaded', function () {
	
        	angular.element('html, body, #content').animate({ scrollTop: 0 }, 200);

        	setTimeout(function () {
          		angular.element('#wrap').css('visibility','visible');

          		if (!angular.element('.dropdown').hasClass('open')) {
    				angular.element('.dropdown').find('>ul').slideUp();
          		}
        	}, 200);
      	});
      	$rootScope.containerClass = toState.containerClass;
    });
}]);

//Rest Api Base URL
var base_url="http://example.com/";

app.factory('httpService',function ($http,$q,$cookies,$httpParamSerializerJQLike) {
 	
    var service  = this;
	var entity   = {};
    var response = {};

    //Service to view data
    service.dataResult = function (entity){
        var deferred = $q.defer();
        var pureData;

        service.http(entity).then(function (data) {

            if(data.result)
            {
                pureData = data.result;
            }
            else
            {
                pureData = data;
            }


            deferred.resolve(pureData);
        });
        return deferred.promise;
    };

    //Service to log in
    service.dataFull = function(entity){
        var deferred = $q.defer();

        if(entity.query_params == "")
        {
            entity.query_params = "";
        }
        else
        {
            entity.query_params = "?" + entity.query_params;
        }

        if(entity.default_params == null)
        {
            entity.default_params = "";
        }
        else if(entity.query_params == "" && entity.default_params!=null)
        {
            entity.default_params = "?" + entity.default_params;

        }else if(entity.query_params != "" && entity.default_params!=null){
            entity.default_params = "&" + entity.default_params;
        }




        var url = entity.url + entity.query_params + entity.default_params;

        var headers = {};
        var data;
        switch(entity.content_type)
        {
            case "json":
                headers['Content-Type']="application/json";
                data = angular.toJson(entity.body_params);
                break;
            case "formData":
                data = $httpParamSerializerJQLike(entity.body_params);
                headers['Content-Type']="application/x-www-form-urlencoded";
                break;

            default :
                headers['Content-Type']="application/json";
                break;
        }
        $http({
            method:entity.type,
            url :base_url + url,
            data:data,
            headers:headers
        }).then(function mySuccess(data, status, headers, config) {
            response.data = data;
            deferred.resolve(response);
        }, function myError(response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    };

    
    //Main http service
    service.http = function(entity){		
		var deferred = $q.defer();

        if(entity.query_params == "" || entity.query_params == null)
        {
            entity.query_params = "";
        }

        if(entity.default_params == null || entity.default_params == "")
        {
            entity.default_params = "";
        }

		var url = entity.url + "?" + entity.query_params + entity.default_params;

        if(entity.headers['Authorization']){
            var headers =entity.headers;
        }else{
            var headers = {};
        }

		var data;
		switch(entity.content_type)
		{
			case "json":
			 headers['Content-Type']="application/json";
			 data = angular.toJson(entity.body_params);
			break;
			case "formData":
			    data = $httpParamSerializerJQLike(entity.body_params);
				headers['Content-Type']="application/x-www-form-urlencoded";
			break;

			default :
				headers['Content-Type']="application/json";
			break;
		}

        $http({
            method:entity.type,
            url :base_url + url,
            data:data,
			headers:headers
        }).then(function mySuccess(response) {
            deferred.resolve(response.data);
        }, function myError(response) {
            //console.log(response);
            deferred.resolve(response.data);
        });
        return deferred.promise;
    };

    return service;
});

app.factory('tokenService',function ($http,$q,$translateCookieStorage,$window,httpService, $state, toastr) {

    var service = this;
    var entity={};

    service.response = {};
    service.response.result = null;
    service.response.token  = null;

    //Token Control Service
    service.check = function (entity){
        var deferred = $q.defer();

        var token = localStorage.getItem('token');

        if(token)
        {
            service.response = service.validate(entity);
            deferred.resolve(service.response);
        }
        else
        {
            service.response.result = false;
            deferred.resolve(service.response);
        }
        return deferred.promise;
    };

    //Login Service
    service.generate = function (entity){
        var deferred = $q.defer();

        httpService.dataFull(entity).then(function (data) {
            if(data.data.successful!=false){
                localStorage.setItem('token', data.data.headers('authorization'));
                $state.go('app');
            }else
            {
                toastr['error']("Hatalı Kullanıcı adı ya da şifre",{"closeButton": true});
            }
            deferred.resolve(service.response);
        });
        return deferred.promise;
    };

    service.validate = function (entity){
        var deferred = $q.defer();
        service.response.result=true;
        deferred.resolve(service.response);
        return deferred.promise;
    };


    //Logout Service
    service.logout = function (entity){
        var deferred = $q.defer();

        httpService.http(entity).then(function (data) {
            if(data.successful==true){
                toastr['success']("Başarıyla Çıkıldı",{"closeButton": true});
                localStorage.removeItem('token');
                $state.go('core.login');
            }else{
                toastr['error']("Hata Oluştu",{"closeButton": true});
                $state.go('core.login');
                localStorage.removeItem('token');
            }
        });
        return deferred.promise;
    };

    return service;
});

//Data which generates all application, as an example;
var data = {"entities":[{"name":"recipe","name_tr":"Yemek Tarifi","is_visible":true,"is_pagination":false,"icon":"flag-o","methods":{"view":{"url":"api/recipe/view","type":"post","headers":[],"default_params":["limit","offset","orderBy","orderType"],"query_params":[],"body_params":{},"content_type":"json","is_active":true},"detail":{"url":"EurogidaBackEnd/api/recipe/view","type":"post","headers":[],"default_params":[],"query_params":["id"],"body_params":{},"content_type":"application/json","is_active":true},"create":{"url":"api/recipe/create","type":"post","headers":[],"default_params":[],"query_params":[],"body_params":{},"content_type":"json","is_active":true},"delete":{"url":"EurogidaBackEnd/api/recipe/delete","type":"delete","headers":[],"default_params":[],"query_params":["id"],"body_params":{},"content_type":"application/json","is_active":false},"update":{"url":"ticketing/rest/pier/update","type":"post","headers":["token"],"default_params":[],"query_params":[],"body_params":{},"content_type":"application/json","is_active":true}},"fields":[{"param":"id","label":null,"type":"text","value":null,"fk_service":null,"mask":null,"validation ":null,"tabIndex":null,"placeholder":null,"attributes":null,"component_params":null,"is_hidden":true,"is_view":false,"is_detail":false,"is_delete":false,"is_update":false,"is_create":false,"is_required":false,"is_filter":{"value":false,"model":null},"object_model":{"view":"id","detail":null,"update":"id"}},{"param":"recipe_name","label":"Yemek Adı","type":"text","value":"","fk_service":null,"mask":"","validation":[{"item":"maxlength","value":100}],"tabIndex":1,"placeholder":"Yemek Adı","attributes":"","component_params":null,"is_hidden":false,"is_view":true,"is_detail":true,"is_delete":true,"is_update":true,"is_create":true,"is_required":true,"is_filter":{"value":false,"model":null},"object_model":{"view":"recipe_name","detail":"recipe_name","update":"recipe_name"}},{"param":"material","label":"Malzemeler","type":"textarea","value":"","fk_service":null,"mask":"","validation":[{"item":"maxlength","value":100}],"tabIndex":1,"placeholder":"Malzemeler","attributes":"","component_params":null,"is_hidden":false,"is_view":false,"is_detail":true,"is_delete":true,"is_update":true,"is_create":true,"is_required":true,"is_filter":{"value":false,"model":null},"object_model":{"view":"material","detail":"material","update":"material"}},{"param":"personality","label":"Kaç Kişilik","type":"text","value":"","fk_service":null,"mask":"","validation":[{"item":"digits","value":true}],"tabIndex":1,"placeholder":"Kaç Kişilik","attributes":"","component_params":null,"is_hidden":false,"is_view":false,"is_detail":true,"is_delete":true,"is_update":true,"is_create":true,"is_required":true,"is_filter":{"value":false,"model":null},"object_model":{"view":"personality","detail":"personality","update":"personality"}},{"param":"calorie","label":"Kalori","type":"text","value":"","fk_service":null,"mask":"","validation":[{"item":"digits","value":true}],"tabIndex":1,"placeholder":"Kalori","attributes":"","component_params":null,"is_hidden":false,"is_view":false,"is_detail":true,"is_delete":true,"is_update":true,"is_create":true,"is_required":true,"is_filter":{"value":false,"model":null},"object_model":{"view":"calorie","detail":"calorie","update":"calorie"}},{"param":"recipe_text","label":"Tarif","type":"textarea","value":"","fk_service":null,"mask":"","validation":[{"item":"maxlength","value":5000}],"tabIndex":1,"placeholder":"Tarif","attributes":"","component_params":null,"is_hidden":false,"is_view":false,"is_detail":true,"is_delete":true,"is_update":true,"is_create":true,"is_required":true,"is_filter":{"value":false,"model":null},"object_model":{"view":"recipe_text","detail":"recipe_text","update":"recipe_text"}},{"param":"cover_photo","label":"Kapak Fotoğrafı","type":"file_upload","value":"","fk_service":null,"mask":"","validation":[],"tabIndex":1,"placeholder":"","attributes":"","component_params":null,"is_hidden":false,"is_view":false,"is_detail":true,"is_delete":true,"is_update":true,"is_create":true,"is_required":true,"is_filter":{"value":false,"model":null},"object_model":{"view":"cover_photo","detail":"cover_photo","update":"cover_photo"}},{"param":"is_home","label":"Anasayfada Gözüksün mü?","type":"toggle","value":null,"fk_service":null,"mask":null,"validation":null,"tabIndex":2,"placeholder":null,"attributes":null,"component_params":null,"is_hidden":false,"is_view":false,"is_detail":true,"is_delete":false,"is_update":true,"is_create":true,"is_required":true,"is_filter":{"value":false,"model":null},"object_model":{"view":"is_home","detail":"is_home","update":"is_home"}}]},{"name":"token","name_tr":"Login","is_pagination":false,"is_visible":false,"icon":null,"methods":{"view":{},"create":{"url":"EurogidaBackEnd/api/recipe/create","type":"post","headers":[],"default_params":[],"query_params":[],"body_params":{"username":null,"password":null},"content_type":"json","is_active":true},"delete":{"url":"EurogidaBackEnd/api/account/logout","type":"post","headers":[],"default_params":[],"query_params":[],"body_params":{}},"update":{}},"fields":[]},{"name":"recipecategory","name_tr":"Yemek Kategori","is_visible":true,"is_pagination":false,"icon":"road","methods":{"view":{"url":"api/recipecategory/view","type":"post","headers":[],"default_params":["limit","offset","orderBy","orderType"],"query_params":[],"body_params":{},"content_type":"json","is_active":true},"detail":{"url":"api/recipecategory/view","type":"post","headers":[],"default_params":[],"query_params":["id"],"body_params":{},"content_type":"application/json","is_active":true},"create":{"url":"api/recipecategory/create","type":"post","headers":[],"default_params":[],"query_params":[],"body_params":{},"content_type":"json","is_active":true},"delete":{"url":"api/recipecategory/delete","type":"post","headers":[],"default_params":[],"query_params":["id"],"body_params":{},"content_type":"application/json","is_active":false},"update":{"url":"api/recipecategory/update","type":"post","headers":[],"default_params":[],"query_params":[],"body_params":{},"content_type":"application/json","is_active":true}},"fields":[{"param":"id","label":null,"type":"text","value":null,"fk_service":null,"mask":null,"validation ":null,"tabIndex":null,"placeholder":null,"attributes":null,"component_params":null,"is_hidden":true,"is_view":false,"is_detail":false,"is_delete":false,"is_update":false,"is_create":false,"is_required":false,"is_filter":{"value":false,"model":null},"object_model":{"view":"id","detail":null,"update":"id"}},{"param":"recipe_category_name","label":"Yemek Kategorisi","type":"text","value":"","fk_service":null,"mask":"","validation":[{"item":"maxlength","value":100}],"tabIndex":"1","placeholder":"Yemek Kategorisi","attributes":"","component_params":null,"is_hidden":false,"is_view":true,"is_detail":true,"is_delete":true,"is_update":true,"is_create":true,"is_required":true,"is_filter":{"value":false,"model":null},"object_model":{"view":"recipe_category_name","detail":"recipe_category_name","update":"recipe_category_name"}}]}]};

//Field Format
var fieldFormat = {
    param : "",
    label : "",
    type : "",
    value :"",
    fk_service : {},
    component_params : {},
    mask : {},
    validation : {},
    tabIndex : "",
    placeholder : "",
    attributes :[],
    is_filter : "",
    is_required : ""
};

//Default Providers
app.config(function ($httpProvider) {
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
});

//Validation Config
app.config(function ($validatorProvider) {
    $validatorProvider.setDefaultMessages({
        required: "Bu alanın doldurulması zorunludur.",
        remote: "Lütfen bu alanı düzeltin.",
        email: "Lütfen geçerli bir e-posta adresi giriniz.",
        url: "Lütfen geçerli bir web adresi (URL) giriniz.",
        date: "Lütfen geçerli bir tarih giriniz.",
        dateISO: "Lütfen geçerli bir tarih giriniz(ISO formatında)",
        datetime: "Lütfen geçerli bir tarih giriniz",
        plate: "Lütfen geçerli bir plaka giriniz",
        number: "Lütfen geçerli bir sayı giriniz.",
        digits: "Lütfen sadece sayısal karakterler giriniz.",
        creditcard: "Lütfen geçerli bir kredi kartı giriniz.",
        equalTo: "Lütfen aynı değeri tekrar giriniz.",
        accept: "Lütfen geçerli uzantıya sahip bir değer giriniz.",
        maxlength: $validatorProvider.format("Lütfen en fazla {0} karakter uzunluğunda bir değer giriniz."),
        minlength: $validatorProvider.format("Lütfen en az {0} karakter uzunluğunda bir değer giriniz."),
        rangelength: $validatorProvider.format("Lütfen {0} karakter uzunluğunda bir değer giriniz."),
        range: $validatorProvider.format("Lütfen {0} ile {1} arasında bir değer giriniz."),
        max: $validatorProvider.format("Lütfen {0} değerine eşit ya da daha küçük bir değer giriniz."),
        min: $validatorProvider.format("Lütfen {0} değerine eşit ya da daha büyük bir değer giriniz."),
        require_from_group: "Lütfen bu alanların en az {0} tanesini doldurunuz."
    });
});

//Route Config
app.config(function($urlRouterProvider,$stateProvider) {
    
    $urlRouterProvider.otherwise('/app/route/create');
    
    $stateProvider
    .state('app', {
      url: '/app',
      cache:false,
	  templateUrl: 'views/tmpl/app.html'
    })   
	.state('core', {
      url: '/core',
	  abstract: true,
      cache:false,
	  template: '<div ui-view></div>'
    })
    .state('core.login', {
        url: '/token/create',
        cache:false,
        controller: 'tokenController',
        templateUrl: 'views/tmpl/login.html'
    })
    .state('app.create', {
      url: '/:entityName/create',
      cache:false,
      controller: 'createController',
      templateUrl: 'views/tmpl/create.html'
    })
    .state('app.create.component', {	
      templateUrl: 'views/tmpl/component2.html'
    })
        .state('app.update.component', {
            templateUrl: 'views/tmpl/component2.html'
        })
    .state('app.view', {

        url: '/:entityName/view',
        cache:false,
        controller: 'viewController',
        templateUrl: 'views/tmpl/view.html'
    })
    .state('app.delete', {
        url: '/:entityName/delete/:id',
        cache:false,
        controller: 'deleteController'
    })
    .state('app.detail', {
        url: '/:entityName/detail/:id',
        cache:false,
        controller: 'detailController'
    })
    .state('app.update', {
        url: '/:entityName/update/:id',
        cache:false,
        controller: 'updateController',
        templateUrl: 'views/tmpl/update.html'
    })
});

//Main Controller
app.controller('MainCtrl', function ($scope,$http) {

  $scope.main = {
      title: 'Admin Panel',
      settings: {
        navbarHeaderColor: 'scheme-default',
        sidebarColor: 'scheme-default',
        brandingColor: 'scheme-default',
        activeColor: 'default-scheme-color',
        headerFixed: true,
        asideFixed: true,
        rightbarShow: false
      }
    };

  	$scope.clearCache = function() { 
    $templateCache.removeAll();
  }
});

//Nav Controller
app.controller('NavCtrl', function ($scope,$http) {
 
    $scope.entityList = data.entities;

});

//Create Controller
app.controller('createController', function ($scope,$http,$rootScope, $timeout, $window, $filter, $state,httpService,$q, toastr) {

    // Datepicker Settings (You should set specific settings for each datepicker in html)
    $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.opened = [];
    $scope.open = function(index) {
        $timeout(function() {
            $scope.opened[index] = true;
        });
    };

    $scope.initDate = new Date();
    $scope.dateOptions = {formatYear: 'yy',startingDay: 1, 'class': 'datepicker' };
    $scope.timeOptions = {showMeridian:false};
    $scope.format ='dd/MM/yyyy HH:mm';
    $scope.today = function() {     $scope.dt = new Date();  };
    $scope.clear = function () {    $scope.dt = null;  };
    $scope.open2 = function($event) {  $scope.opened2 = true; };
    $scope.format2 ='dd/MM/yyyy';
    $scope.dateFormat = 'dd/MM/yyyy HH:mm';

    //////////////////////////////////////

    //Makes the 'add a new' button dynamic as the entity name
    $scope.entityTrName=data.entities[arrKey].name_tr;
    $scope.entityName=data.entities[arrKey].name;
    var trName=data.entities[arrKey].name_tr;
    var res= trName.split(' ');
    if(res.length>2){
        $scope.pageName=res[0]+' '+res[1];
    }else{
        $scope.pageName=res[0]
    }


    //Create Model
	$scope.Models = {};
	$scope.entityName = $rootScope.$stateParams.entityName;

	var arrKey;	
	
	for (var i = 0; i < data.entities.length ; i++) { 
  		if (data.entities[i].name === $scope.entityName) { 
    		arrKey = i;
    		break;
  		} 
  	}


  	//Current Entity Name
    $scope.currentEntityName=data.entities[arrKey].name;

	//fieldList
  	$scope.fieldList = data.entities[arrKey].fields;

  	$scope.componentParamsInitial = [];


    //Validation Options
    $scope.validationOptions = {
        rules: {}
    };


    angular.forEach(data.entities[arrKey].fields, function (value){

        // Validation rule for each field
        var masking = {};
        $scope.validationOptions.rules[value.param]={};

        // check if required
        if(value.is_required)
        {
            $scope.validationOptions.rules[value.param].required = true;
        }

        if(value.validation)
        {

            angular.forEach(value.validation,function(rule){
                $scope.validationOptions.rules[value.param][rule.item] = rule.value;

                if(rule.item == 'digits' && rule.value==true)
                {
                    masking.mask = "9{*}";
                }
                if(rule.item == 'length')
                {
                    if(masking.mask)
                    {
                        masking.mask = masking.mask.replace("{*}","{"+rule.value+"}");
                    }
                    else
                    {
                        masking.mask = "*";
                        masking.repeat = rule.value;
                    }
                }
                if(rule.item == 'minlength')
                {
                    if(masking.mask)   // if mask present, update
                    {
                        masking.mask = masking.mask.replace("{*}","{"+rule.value+",20}");
                    }
                    else   // form a mask
                    {
                        masking.mask = "*{"+rule.value+",*}";
                    }
                }
                if(rule.item == 'maxlength')
                {
                    if(masking.mask)   // if mask present, update
                    {
                        masking.mask = masking.mask.replace("{*}","{0,"+rule.value+"}");
                    }
                    else   // form a mask
                    {
                        masking.mask = "*{0,"+rule.value+"}";
                    }
                }
                if(rule.item == 'plate')
                {
                    masking.mask = "9{2}a{1,3}9{2,4}";
                }
                if(rule.item == 'datetime')
                {
                    masking = {};
                    masking.alias = 'datetime';
                }

            });
        }

        // give the mask for the field
        value.mask = masking;

        //if field type is a component
		if(value.type == 'component')
  		{
            $scope.componentParamsInitial[value.param] = {};
            $scope.componentParamsInitial[value.param].flag = true;
            $scope.componentParamsInitial[value.param].length = value.component_params.fields.length;
            $scope.componentParamsInitial[value.param].content = [];
            
            $scope.componentFieldLength=value.component_params.fields.length;

            angular.forEach(value.component_params.fields, function (field){
                $scope.componentParamsInitial[value.param].content.push(field);
            });

            value.component_params.fields = [];   // cached and cleaned

  		}
  	});

    //To fill selectboxes with data correctly
  	$scope.fillOptions = function (field)
  	{
        field.value = [];
        var deferred = $q.defer();

        //return deferred.promise;
        var token=localStorage.getItem('token');

        field.fk_service.body_params={};

        httpService.http(field.fk_service).then(function (data){

            angular.forEach(data.result,function(that){
                var temp = {};
                temp.key = that.id;
                temp.value = that.name;
                field.value.push(temp);
            });

            deferred.resolve(data);
  		});

        return deferred.promise;

  	};
  	

  	//To reset component models
  	$scope.resetCompModels = function (field)
    {
        angular.forEach(field.component_params.fields, function (value){
            $scope.Models[value.param] = "";
        });
    };

  	//To add a new component ( for ex; click a button and add a new selectbox)
  	$scope.addComponent = function (param)
  	{
  		$state.go('app.create.component');
  		  		
  		angular.forEach(data.entities[arrKey].fields, function (value){

  			if(value.param == param)
  			{
  				if(value.component_params.type == 'list' && value.is_create==true)
                {
                    angular.forEach($scope.componentParamsInitial[param].content, function (field){
                        value.component_params.fields.push(field);
                    });
                }
                else if(value.component_params.type == 'form' && value.is_create==true) {
                    angular.forEach($scope.componentParamsInitial[param].content, function (field){
                        value.component_params.fields.push(field);
                    });
                }
                else if(value.component_params.type == 'table' && value.is_create==true) {

                    var inputName;
                    var inputType;

                    angular.forEach($scope.componentParamsInitial[param].content, function (field){

                        if(field.type != 'fk_select')
                        {
                            inputName = field.param;
                            inputType = field.type;
                        }

                    });

                    angular.forEach($scope.componentParamsInitial[param].content, function (field){
                        if(field.type == 'fk_select')
                        {
                            var token=localStorage.getItem('token');

                            field.fk_service.body_params={};

                            $scope.fillOptions(field).then(function(e){

                                angular.forEach(e.result, function (options){

                                    var tempWrapObj = {};
                                    var tempArray = [];
                                    var tempObj  = angular.copy(fieldFormat);
                                    var tempObj2 =  angular.copy(fieldFormat);

                                    tempObj.param = field.param;
                                    tempObj.type = "label";
                                    tempObj.value = options.id;
                                    tempObj.label = options.name;

                                    tempObj2.param = inputName;
                                    tempObj2.type  = inputType;

                                    tempArray.push(tempObj);
                                    tempArray.push(tempObj2);

                                    tempWrapObj.data = tempArray;

                                    value.component_params.fields.push(tempWrapObj);
                                });


                            });
                        }

                    });

                }
  			}
  		});

  	};


  	//Sending data to API
  	$scope.sendData = function (form)
  	{
		if(form.validate()){
        angular.forEach(data.entities[arrKey].fields, function(value){

            if(value.type == 'component') {
                if (value.component_params.type == 'form') {
                    angular.forEach(value.component_params.fields, function (value, key) {

                        var temp;

                        angular.forEach($scope.Models[value.param], function (value) {
                            temp = value;
                        });

                        $scope.Models[value.param] = temp;

                    });

                    if($scope.Models[value.component_params.binder.fields]) {
                        delete $scope.Models[value.component_params.binder.fields.value]; // binder'ın ng-modelini algılamaması ve post içinde göndermemesi için siliyoruz
                    }

                }
                else if (value.component_params.type == 'list') {

                    angular.forEach(value.component_params.fields, function (value, key) {

                        var temp = [];

                        angular.forEach($scope.Models[value.param], function (that) {
                            if (that)
                                temp.push(that);
                        });
                        $scope.Models[value.param] = temp;

                    });

                }
                else if (value.component_params.type == 'table') {

                    // angular.forEach(value.component_params.fields, function (value, key) {
                    //
                    //     var temp = [];
                    //
                    //     angular.forEach($scope.Models[value.param], function (that) {
                    //         console.log(that);
                    //         if (that)
                    //             temp.push(that);
                    //     });
                    //     $scope.Models[value.param] = temp;
                    //
                    // });

                    //GEÇİCİ OLARAK FİYAT ENTİTY Sİ İÇİN YAPILDI
                    var length=$("#tableComponent tr").length;
                    var pricingCriteria = [];
                    for (var i = 0; i < length; i++) {
                        var a =$("#datasds-" + i).data('value');
                        var b =$("#datasds2-" + i).val();
                        pricingCriteria.push({pricingCriterionId:a,price:b});

                    }
                    delete $scope.Models['price'];
                    $scope.Models['pricingCriteria']=pricingCriteria;

                }
            }else if(value.type=='date' || value.type=='datetime'){

                //You should set your date format as you wish
                $scope.Models[value.param] = $filter('date')($scope.Models[value.param],'yyyy-MM-dd HH:mm:ss');

            }
  		});

        var currentEntity=data.entities[arrKey].name;

        //copies the data create method of current entity to create a new object
        var createObject=angular.copy(data.entities[arrKey].methods.create);


        //Fills the copied object fields as query_params, body_params etc...
        createObject.query_params=[];

        var token=localStorage.getItem('token');

        createObject.body_params={};
        createObject.body_params=$scope.Models;

        var entName=data.entities[arrKey].name;

        //Sends object to http service
            httpService.http(createObject).then(function (data){
                if(data.successful==true){
                    toastr['success']("Ekleme Başarılı",{"closeButton": true});
                    $state.go('app.view', { entityName: currentEntity});
                }else{
                    toastr['error'](data.messages[0] +"-"+ data.messages[1],{"closeButton": true});
                }
            });
  	    }
	};

  	//To come back the page before
    $scope.goBack=function () {
        var currentEntity=data.entities[arrKey].name;
        $state.go('app.view', { entityName: currentEntity});
    }
	
});

//View Controller
app.controller('viewController', function ($scope,$http,$rootScope,$state,httpService,translationService,$q,$compile,$uibModal,$log, DTOptionsBuilder,DTColumnDefBuilder, DTColumnBuilder, toastr, $window) {

    //Datepicker Settings
    $scope.today = function() {     $scope.dt = new Date();  };
    $scope.clear = function () {    $scope.dt = null;  };

    $scope.dateOptions = {formatYear: 'yy',startingDay: 1, 'class': 'datepicker' };
    $scope.timeOptions = {showMeridian:false};
    $scope.initDate = new Date();

    $scope.opened = [];
    $scope.open = function(model) {
        $timeout(function() {
            $scope.opened[model] = true;
        });
    };

    $scope.dateFormat = 'dd/MM/yyyy HH:mm';


    $scope.Filters = {};
    //Filter component in html is on or off
    $scope.filterOnOff = function(value)
    {
        $scope.val = !value;
    };

    $scope.entityName = $rootScope.$stateParams.entityName;

    var arrKey;

    for (var i = 0; i < data.entities.length ; i++) {
        if (data.entities[i].name === $scope.entityName) {
            arrKey = i;
            break;
        }
    }

    $scope.entityTrName=data.entities[arrKey].name_tr;

    //initialize general filter icon
    $scope.hasFilter=false;


    //Makes the dynamic of 'add a new' button
    var trName=data.entities[arrKey].name_tr;
    var res= trName.split(' ');
    var createBtnName;
    if(res.length>2){
        createBtnName=res[0]+' '+res[1];
    }else{
        createBtnName=res[0]
    }

    //Datatable Lang Settings for Turkish
    var lang = {
        "decimal":        "",
        "emptyTable":     "Kayıt Bulunamadı",
        "info":           "( Toplam _TOTAL_ kayıttan _START_ ile _END_ arasındakiler gösteriliyor )",
        "infoEmpty":      "Kayıt Bulunamadı",
        "infoFiltered":   "(_MAX_ kayıt içinden filtrelendi)",
        "infoPostFix":    "",
        "thousands":      ",",
        "lengthMenu":     "_MENU_ kayıt göster",
        "loadingRecords": "Yükleniyor...",
        "processing":     "Yükleniyor...",
        "sSearch": "" ,
        "searchPlaceholder": "Tabloda Arayın...",
        "zeroRecords":    "Kayıt Bulunamadı",
        "paginate": {
            "first":      "İlk",
            "last":       "Son",
            "next":       "İleri",
            "previous":   "Geri"
        },
        "aria": {
            "sortAscending":  ": activate to sort column ascending",
            "sortDescending": ": activate to sort column descending"
        },
        "buttons":{
            "copyTitle":"Kopyalandı",
            "copySuccess": {
                _: '%d kayıt kopyalandı',
                1: '1  kayıt kopyalandı'
            }
        }
    };

    var vm = this;

    var viewUrl = {};

    viewUrl = angular.copy(data.entities[arrKey].methods.view);

    viewUrl.query_params = [];
    viewUrl.default_params = null;
    viewUrl.headers=[];

    var token=localStorage.getItem('token');

    vm.source=[];

    // before datatables with no pagination, individual column filtering placed
    var columnFilters=[];
    var filteringObj = {};

    // initialize withButtons plugin,
    var withButtonsArray = [
        { extend: 'colvis', text: 'Tablo Görünümü' },
        { extend: 'copy', text: 'Kopyala' },
        { extend: 'print', text: 'Yazdır' },
        {
            extend: 'pdf',
            text: 'PDF',
            exportOptions: {
                modifier: {
                    page: 'current'
                }
            }
        },
        { extend: 'excel', text: 'Excel' }
    ];


    // add create button if method is present
    if(data.entities[arrKey].methods.create.is_active) {
        var addCreateBtn = {
            text: 'Yeni '+createBtnName+' Ekle',
            key: '1',
            className:'createButton',
            action: function (e, dt, node, config) {
                var currentEntity=data.entities[arrKey].name;
                $state.go('app.create', { entityName: currentEntity});
            }
        };
        withButtonsArray.push(addCreateBtn);
    }


    // hide tfoot (individual column filtering plugin) when pagination is present
    $scope.is_pagination = data.entities[arrKey].is_pagination;

    //Datatables generation

    //Server side pagination !!! using datatables
    if(data.entities[arrKey].is_pagination){

        vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', function(data, callback, settings){

            viewUrl.default_params='limit='+data.length+'&offset='+(data.start);

            httpService.dataResult(viewUrl).then(function (result){
                console.log(result);
                if(result.data)
                {
                    callback({
                        recordsTotal: result.total,
                        recordsFiltered:  result.total,
                        data: result.data
                    });
                }
                else
                {
                    callback({
                        recordsTotal: 0,
                        recordsFiltered:  0,
                        data: []
                    });
                }
            });

        })

            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withPaginationType('full_numbers')
            .withOption('initComplete', function() {

                var checkIfDate = false;

                var innerContainer = '<div class="toolbar-inner" ng-show="val"></div>';
                angular.element('div.toolbar').append($compile(innerContainer)($scope));

                angular.forEach(data.entities[arrKey].fields, function (field){

                    if(field.type=='fk_select' && field.is_filter.value){

                        fillOptions(field).then(function (data){

                            //console.log(field);

                            var html  = '<p class="input-group"><select tabindex="'+field.tabIndex+'" placeholder="'+field.placeholder+'" class="form-control form-filters" id="'+field.param+'" name="'+field.param+'" ng-model="Filters.'+[field.is_filter.model]+'" ng-mask="'+field.mask+'"  ng-validation="'+field.validation+'">';
                            html += '<option selected="true" value="">'+field.label+'</option>';

                            angular.forEach(field.value,function (opt){

                                if(field.param == 'status') // translation needed
                                {
                                    html += '<option value="'+opt.key+'">'+translationService.translate(opt.value)+'</option>';
                                }
                                else
                                {
                                    html += '<option value="'+opt.key+'">'+opt.value+'</option>';
                                }


                            });

                            html += '</select></p>';

                            angular.element('div.toolbar-inner').append($compile(html)($scope));
                        });

                        //console.log(field);
                    }
                    else if(field.type=='text' && field.is_filter.value){
                        var html  = '<p class="input-group"><input tabindex="'+field.tabIndex+'" placeholder="'+field.placeholder+'" class="form-control form-filters" id="'+field.param+'" name="'+field.param+'" ng-model="Filters.'+[field.is_filter.model]+'" ng-mask="'+field.mask+'"  ng-validation="'+field.validation+'"></p>';

                        angular.element('div.toolbar-inner').append($compile(html)($scope));

                    }
                    else if (field.type == 'select' && field.is_filter.value){
                        var html  = '<p class="input-group"><select tabindex="'+field.tabIndex+'" placeholder="'+field.placeholder+'" class="form-control form-filters" id="'+field.param+'" name="'+field.param+'" ng-model="Filters.'+[field.is_filter.model]+'" ng-mask="'+field.mask+'"  ng-validation="'+field.validation+'">';
                        html += '<option selected="true" value="">'+field.label+'</option>';

                        angular.forEach(field.value,function (opt){
                            if(field.param == 'status') // translation needed
                            {
                                html += '<option value="'+opt.key+'">'+translationService.translate(opt.value)+'</option>';
                            }
                            else
                            {
                                html += '<option value="'+opt.key+'">'+opt.value+'</option>';
                            }
                        });

                        html += '</select></p>';

                        angular.element('div.toolbar-inner').append($compile(html)($scope));
                    }
                    else if(field.type=='datetime' && field.is_filter.value){
                        //checkIfDate = true;
                        var html='<p class="input-group"><input type="text" class="form-control"  datetime-picker="{{dateFormat}}" is-open="opened[\''+field.param+'Start\']" min-date="minDate" datepicker-options="dateOptions" timepicker-options="timeOptions" placeholder="'+field.label+' - Başlangıç" id="'+field.param+'Start" name="'+field.param+'Start" ng-model="Filters[\''+field.param+'Start\']" ng-value="" ng-mask="" close-text="Kapat"/> <span class="input-group-btn"> <button type="button" class="btn btn-default" ng-click="open('+field.param+'Start)"><i class="fa fa-calendar"></i></button> </span> </p>';
                        html   +='<p class="input-group"><input type="text" class="form-control"  datetime-picker="{{dateFormat}}" is-open="opened[\''+field.param+'End\']" min-date="minDate" datepicker-options="dateOptions" timepicker-options="timeOptions" placeholder="'+field.label+' - Bitiş" id="'+field.param+'End" name="'+field.param+'End" ng-model="Filters[\''+field.param+'End\']" ng-value="" ng-mask="" close-text="Kapat"/> <span class="input-group-btn"> <button type="button" class="btn btn-default" ng-click="open('+field.param+'End)"><i class="fa fa-calendar"></i></button> </span> </p>';
                        angular.element('div.toolbar-inner').append($compile(html)($scope));
                    }



                });

                var html = '<input type="button" class="form-control btn" value="Filtrele" ng-click="showCase.applyFilter()" />';
                angular.element('div.toolbar-inner').append($compile(html)($scope));

            })
            .withBootstrap()
            .withDOM('l<"toolbar">rtip')
            // Active ColVis plugin
            .withOption('createdRow', function(row) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            })
            .withColVis()
            .withOption('language', lang)
            // Add a state change function
            .withColVisStateChange(stateChange)
            // Exclude the last column from the list
            .withColVisOption('aiExclude', [2])
            // Add Table tools compatibility
            .withTableTools('vendor/datatables/TableTools/swf/copy_csv_xls_pdf.swf')
            .withButtons(withButtonsArray);
    } else
    {
        //Client side pagination !!! using datatables
        vm.dtOptions = DTOptionsBuilder.fromFnPromise(httpService.dataResult(viewUrl))
            .withBootstrap()
            // Active ColVis plugin
            .withOption('createdRow', function(row) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            })
            .withColVis()
            .withOption('language', lang)
            // Add a state change function
            .withColVisStateChange(stateChange)
            // Exclude the last column from the list
            .withColVisOption('aiExclude', [2])
            // Add Table tools compatibility
            .withTableTools('vendor/datatables/TableTools/swf/copy_csv_xls_pdf.swf')
            .withDOM('flrtip')
            .withColumnFilter({
                aoColumns:columnFilters
            })
            .withButtons(withButtonsArray);
    }


    var columnNames=[];
    $scope.filterTitles = [];

    angular.forEach(data.entities[arrKey].fields, function (value){

        // place filter icon if any field is filter
        if(value.is_filter.value) $scope.hasFilter = true;

        filteringObj = {};

        if(value.label!=''){
            if(value.object_model.view!=null && value.is_view==true){
                if(value.type=='datetime'){
                    columnNames.push(DTColumnBuilder.newColumn(value.object_model.view).withTitle(value.label).renderWith(formatterHtml));
                    filteringObj.type = 'text';
                }
                else if(value.type=='switch'){
                    columnNames.push(DTColumnBuilder.newColumn(value.object_model.view).withTitle(value.label).renderWith(function(data,type,full,meta){
                        var componentGroup;

                        if(value.type=='switch')
                        {
                            componentGroup ='';

                            componentGroup +=
                                '<div class="onoffswitch greensea">' +
                                '<input type="checkbox" name="'+value.param+full.id+'" class="onoffswitch-checkbox" ng-model="'+value.param+full.id+'" id="switch-'+value.param+full.id+'" ng-init="'+value.param+full.id+'='+full[value.param]+'" ng-change="showCase.fastUpdateEntity(\''+value.param+'\','+full.id+',showCase.entity)" >' +
                                '<label class="onoffswitch-label" for="switch-'+value.param+full.id+'">' +
                                '<span class="onoffswitch-inner"></span>' +
                                '<span class="onoffswitch-switch"></span>' +
                                '</label>' +
                                '</div>';
                        }

                        return componentGroup;


                    }));
                    filteringObj.type = 'text';
                }
                else if(value.type=='select'){
                    columnNames.push(DTColumnBuilder.newColumn(value.object_model.view).withTitle(value.label).renderWith(translatorHtml));
                    filteringObj.type = 'select';
                    filteringObj.bRegex = false;
                    filteringObj.values = [];
                    angular.forEach(value.value,function(item){
                        filteringObj.values.push(translationService.translate(item.value));
                    });
                    //filteringObj.values = value.value;
                }
                else{
                    columnNames.push(DTColumnBuilder.newColumn(null).withTitle(value.label).renderWith(multipleLang));
                    filteringObj.type = 'text';
                }


                // exception for toggle or switch types
                if(value.type != 'toggle' && value.type !='switch')
                {
                    $scope.filterTitles.push(value.label+" Ara...");
                    columnFilters.push(filteringObj);
                }

            }
        }
    });



    vm.entity=data.entities[arrKey];

    if(vm.entity.methods.delete.url || vm.entity.methods.detail.url || vm.entity.methods.update.url)
    {
        // check if action buttons is present
        angular.forEach(vm.entity.fields, function (valueField){
            if(valueField.type=='btn_group'){
                columnNames.push(DTColumnBuilder.newColumn(null).withTitle('Durum').notSortable().renderWith(statusHtml));
            }
        });

        columnNames.push(DTColumnBuilder.newColumn(null).withTitle('İşlemler').notSortable().renderWith(actionsHtml));

    }


    vm.deleteEntity = deleteEntity;
    vm.updateEntity = updateEntity;
    vm.detailEntity = detailEntity;
    vm.updateSelectboxEntity = updateSelectboxEntity;
    vm.softChangeEntity = softChangeEntity;
    vm.fastUpdateEntity = fastUpdateEntity;

    vm.dynamicButtons={};

    vm.dtInstance = {};
    vm.reloadData = function() {
        vm.dtInstance._renderer.rerender();
    };


    vm.applyFilter = function()
    {
        var checkDate=false;
        viewUrl.query_params = "";

        angular.forEach(data.entities[arrKey].fields, function (field) {
            if(field.is_filter.value) {

                if($scope.Filters[field.is_filter.model] != null && $scope.Filters[field.is_filter.model] != "")
                viewUrl.query_params += field.is_filter.model + '=' + $scope.Filters[field.is_filter.model] + "&";
            }

            // check if a date type is present, so that start&end filters be placed
            if(field.type == 'datetime')
            {
                if($scope.Filters[field.param+'Start'] != null && $scope.Filters[field.param+'Start'] != "")
                {
                    //var dateReal = moment($scope.Filters.startDate).format("").replace("+02:00","");
                    var dateReal = moment($scope.Filters[field.param+'Start']).format("YYYY-MM-DD HH:mm:ss");
                    viewUrl.query_params += field.param+'Start' + '=' + dateReal + "&";
                }
                if($scope.Filters[field.param+'End'] != null && $scope.Filters[field.param+'End'] != "")
                {
                    //var dateReal = moment($scope.Filters.endDate).format("").replace("+02:00","");
                    var dateReal = moment($scope.Filters[field.param+'End']).format("YYYY-MM-DD HH:mm:ss");
                    viewUrl.query_params += field.param+'End' + '=' + dateReal + "&";
                }
            }

        });
        vm.dtInstance.reloadData();
    };



    //To fill selectbox data in view.html
    function fillOptions(field)
    {
        field.value = [];

        var deferred = $q.defer();

        //return deferred.promise;
        var token=localStorage.getItem('token');


        field.fk_service.body_params={};

        field.fk_service.default_params='limit=-1&offset=0&orderBy=id&orderType=asc';

        httpService.http(field.fk_service).then(function (data){

            if(data.result)
            {
                if(data.result.data)
                {
                    angular.forEach(data.result.data,function(that){
                        var temp = {};
                        temp.key = that.id;
                        temp.value = that.name;
                        field.value.push(temp);

                    });
                }
                else
                {
                    angular.forEach(data.result,function(that){
                        var temp = {};
                        temp.key = that.id;
                        temp.value = that.name;
                        field.value.push(temp);

                    });
                }

            }
            else {
                angular.forEach(data,function(that){
                    var temp = {};
                    temp.key = that.id;
                    temp.value = that.name;
                    field.value.push(temp);
                });
            }




            deferred.resolve(data);
        });


        return deferred.promise;


    };





    //To set the date correctly in your location
    function formatterHtml(data,type, full, meta) {
        var html='';
        html=moment(data).utcOffset(3).format("DD/MM/YYYY HH:mm");
        return html;
    }

    function translatorHtml(data,type, full, meta) {
        var html='';
        html=translationService.translate(data);
        return html;
    }


    //Generates the detail, update, delete buttons dynamically
    function actionsHtml(data,type, full, meta) {

        vm.dynamicButtons[full.id]=full;
        var optionBox = '';
        var componentGroup = '';

        if(vm.entity.methods.detail.is_active)
            componentGroup += '<button class="icon icon-warning icon-ef-3 icon-ef-3a hover-color" style="margin:0 5px;width: 35px; height: 35px" ng-click="showCase.detailEntity(showCase.dynamicButtons[' + full.id + '], showCase.entity)">' +
            '<i style="font-size: 18px;line-height:18px;" class="fa fa-search"></i>' +
            '</button>&nbsp;';

        if(vm.entity.methods.update.is_active)
            componentGroup += '<button class="icon icon-primary icon-ef-3 icon-ef-3a hover-color" style="margin:0 5px;width: 35px; height: 35px;" ng-click="showCase.updateEntity(showCase.dynamicButtons[' + full.id + '], showCase.entity)">' +
            '<i style="font-size: 18px;line-height:18px;" class="fa fa-edit"></i>' +
            '</button>&nbsp;';

        if(vm.entity.methods.delete.is_active)
            componentGroup += '<button class="icon icon-danger icon-ef-3 icon-ef-3a hover-color" style="margin:0 5px;width: 35px; height: 35px" ng-click="showCase.deleteEntity(showCase.dynamicButtons[' + full.id + '], showCase.entity)">' +
            '<i style="font-size: 18px;line-height:18px;" class="fa fa-trash-o"></i>' +
            '</button>&nbsp;';

        angular.forEach(vm.entity.fields, function (valueField){

            if(valueField.type=='toggle')
            {
                componentGroup += '<button ng-model="'+valueField.param+full.id+'" ng-init="'+valueField.param+full.id+'='+full[valueField.param]+'" class="icon icon-success icon-ef-3 icon-ef-3a hover-color" style="margin:0 5px;width: 35px; height: 35px" ng-style="{opacity: '+valueField.param+full.id+' ? \'1\' : \'0.5\'}" ng-click="showCase.softChangeEntity(\''+valueField.param+'\',showCase.dynamicButtons[' + full.id + '], showCase.entity)">' +
                '<i style="font-size: 18px;line-height:18px;" ng-class="'+valueField.param+full.id+' ? \'fa fa-check\' : \'fa fa-flash\'"></i>' +
                '</button>&nbsp;';
            }
        });

        return componentGroup;
    }


    //Generates a status button and changes the status when clicked
    function statusHtml(data,type, full, meta) {

        vm.dynamicButtons[full.id]=full;
        var optionBox = '';
        var componentGroup = '';

        angular.forEach(vm.entity.fields, function (valueField){

            if(valueField.type=='btn_group'){

                var selected;
                angular.forEach(valueField.attributes[0].condition, function (subValueField,subValueKey){

                    if(full.status == subValueField.status){

                        componentGroup += '<select ng-change="showCase.updateSelectboxEntity(showCase.dynamicButtons[' + full.id + '], showCase.entity)" class="form-control" style="width: 175px;" ng-init="optionValue['+full.id+']=\''+subValueField.value[0].key+'\'" name="'+valueField.param+'" ng-model="optionValue['+full.id+']">' ;

                        angular.forEach(subValueField.value, function (options){

                            optionBox += '<option value="'+options.key+'"><b>'+options.value+'</b></option>';


                        });


                        componentGroup += optionBox +'</select>';

                        //console.log($scope.Models[valueField.param][full.id])
                    }
                    else {

                    }
                });
            }
        });

        return componentGroup;
    }


    //To update a data with selectbox
    function updateSelectboxEntity(full, entity) {

        var statusId=$scope.optionValue[full.id];

        var selectboxObject=angular.copy(entity.methods.update);

        selectboxObject.body_params={};

        var token=localStorage.getItem('token');


        if(Object.keys(selectboxObject.body_params).length>0){
            selectboxObject.body_params={};
            selectboxObject.body_params={id:full.id, statusId:statusId};
            //selectboxObject.body_params.token=token;
        }else{
            selectboxObject.body_params={};
            selectboxObject.body_params={id:full.id, statusId:statusId};
            //selectboxObject.headers['Authorization']=token;
        }

        httpService.http(selectboxObject).then(function (data){
            if(data.successful==true){
                toastr['success']("Düzenleme Başarılı",{"closeButton": true,});
                $state.go($state.current, {}, {reload: true});
            }else{
                toastr['error']("Hata Oluştu",{"closeButton": true,});
            }
        });

    }

    //Updates data only in client side
    function softChangeEntity(modelParam,full, entity) {

        // before sending softchange, get current model value and update (full) object
        var modelValue = $scope[modelParam+''+full.id];

        console.log('mevcut model değeri:'+modelValue);

        var modalInstance = $uibModal.open({
            templateUrl: 'views/tmpl/delete.html',
            controller: 'softChangeController',
            // backdropClass: 'splash' + ' ' + options,
            // windowClass: 'splash' + ' ' + options,
            resolve: {
                entity: function () {
                    return entity;
                },
                full: function () {
                    return full;
                },
                modelParam: function () {
                    return modelParam;
                },
                modelValue:function () {
                    return modelValue;
                }
            }
        });
        modalInstance.result.then(function (newParamVal) {
            $scope[modelParam+''+full.id] = newParamVal;
            console.log('yeni model değeri:'+newParamVal);
        });

    }


    //Updates quickly a data
    function fastUpdateEntity(modelParam,id,entity) {
        var updateObject=angular.copy(entity.methods.update);

        updateObject.body_params.id = id;
        updateObject.body_params[modelParam] = $scope[modelParam+''+id];

        httpService.http(updateObject).then(function (data){
            if(data.successful==true){
                toastr['success']("Düzenleme Başarılı",{"closeButton": true});
                vm.dtInstance.reloadData();
                //$state.go($state.current, {}, {reload: true});
            }else{
                toastr['error']("Hata Oluştu",{"closeButton": true});
            }
        });
    }

    //Opens a modal to delete a data
    function deleteEntity(full, entity) {

        $uibModal.open({
            templateUrl: 'views/tmpl/delete.html',
            controller: 'deleteController',
            // backdropClass: 'splash' + ' ' + options,
            // windowClass: 'splash' + ' ' + options,
            resolve: {
                entity: function () {
                    return entity;
                },
                full: function () {
                    return full;
                }
            }
        });
    }

    //Opens modal to show details of data
    function detailEntity(full, entity) {
        
        $uibModal.open({
            templateUrl: 'views/tmpl/detail.html',
            controller: 'detailController',
            size:'md',
            // backdropClass: 'splash' + ' ' + options,
            // windowClass: 'splash' + ' ' + options,
            resolve: {
                entity: function () {
                    return entity;
                },
                full: function () {
                    return full;
                }
            }
        });
    }

    //To go to the update page of data
    function updateEntity(full) {
        $state.go('app.update', { entityName: data.entities[arrKey].name, id:full.id, full:full});
        $rootScope.row=full;
    }

    vm.dtColumns = columnNames;




});

//Delete Controller
app.controller('deleteController', function ($scope, $rootScope, $http, $state,  $uibModalInstance, httpService, entity, full,toastr) {

    $scope.explanation = 'Bu kaydı silmek istediğinize emin misiniz?';

    $scope.ok = function () {

        //Creates a delete object
        var deleteObject=angular.copy(entity.methods.delete);

        deleteObject.query_params=[];

        var token=localStorage.getItem('token');

        //Send id in query params
        deleteObject.query_params.push('id='+full.id);

        httpService.http(deleteObject).then(function (data){
            if(data.successful==true){
                toastr['success']("Silme Başarılı",{"closeButton": true});
                $state.go($state.current, {}, {reload: true});
                $uibModalInstance.dismiss('cancel');
            }else{
                toastr['error']("Hata Oluştu",{"closeButton": true});
            }
        });

    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});

//Detail Controller
app.controller('detailController', function ($scope, $rootScope, $http, $state,  $uibModalInstance, httpService,translationService, entity, full) {

    $scope.entityName = $rootScope.$stateParams.entityName;
    var id=full.id;

    var arrKey;

    for (var i = 0; i < data.entities.length ; i++) {
        if (data.entities[i].name === $scope.entityName) {
            arrKey = i;
            break;
        }
    }

    $scope.fieldList = data.entities[arrKey].fields;
    
    $scope.detailName = data.entities[arrKey].name_tr;

    var detailObject=angular.copy(entity.methods.detail);

    detailObject.default_params=[];


    var token=localStorage.getItem('token');

    detailObject.query_params=[];
    detailObject.query_params.push('id='+full.id);




    angular.forEach(data.entities[arrKey].fields, function (value){

        if(value.type == 'component')
        {
            $scope.componentType=value.component_params.type;
        }
    });


    var rows=[];
    httpService.http(detailObject).then(function (dataDetail) {
        angular.forEach(data.entities[arrKey].fields, function (valuesOfFields){
                if(valuesOfFields.is_detail==true){

                    //makes 'tr' dynamic
                    var comprows=[];

                    //makes 'td' dynamic
                    var comprowsTD=[];

                    //makes 'th' dynamic
                    var THs=[];

                    if(valuesOfFields.type=='component'){

                        if(valuesOfFields.component_params!=null && valuesOfFields.component_params.type=='table') {
                            angular.forEach(valuesOfFields.component_params.fields, function (labels) {
                                THs.push(labels.label);
                            });

                            $scope.THs = THs;

                            angular.forEach(dataDetail.result, function (valueRow, key) {

                                if (valuesOfFields.param == key) {
                                    angular.forEach(valueRow, function (subValueRow) {

                                        var dynamicFields = {};
                                        var dynamicFieldsTD = [];

                                        angular.forEach(valuesOfFields.component_params.fields, function (valueCompfield, key) {

                                            dynamicFields[valueCompfield.param] = subValueRow[valueCompfield.param];
                                            dynamicFieldsTD.push(subValueRow[valueCompfield.param]);

                                        });
                                        comprows.push(dynamicFields);
                                        comprowsTD.push(dynamicFieldsTD);
                                    });

                                }

                                $scope.comprows = comprows;
                                $scope.comprowsTD = comprowsTD;
                            });

                        }
                        else if(valuesOfFields.component_params!=null && valuesOfFields.component_params.type=='form'){
                            angular.forEach(valuesOfFields.component_params.fields, function (labels) {

                                var temp = labels.object_model.detail;
                                var displayValue = eval("dataDetail.result."+temp);
                                rows.push({name: labels.label, value:displayValue});
                            });
                        }
                    }else{

                        var temp = valuesOfFields.object_model.detail;
                        var displayValue = eval("dataDetail.result."+temp);

                        if(valuesOfFields.type=='datetime'){

                            displayValue = moment(displayValue).utcOffset(3).format("DD/MM/YYYY HH:mm");
                        }
                        else if(valuesOfFields.type=='toggle' || valuesOfFields.type=='switch')
                        {
                            if(displayValue)
                            {
                                displayValue = 'Evet';
                            }
                            else {
                                displayValue = 'Hayır';
                            }
                        }
                        else if(valuesOfFields.type=='select')
                        {
                            displayValue = translationService.translate(displayValue);
                        }

                        rows.push({name: valuesOfFields.label, value:displayValue});

                    }
                }
        });
    });
    $scope.rows=rows;


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});

//Update Controller
app.controller('updateController', function ($scope,$http,$rootScope, $filter, $state,httpService,$q,$timeout, toastr) {
// Datepicker Settings
    $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.opened = [];
    $scope.open = function(index) {
        $timeout(function() {
            $scope.opened[index] = true;
        });
    };

    $scope.initDate = new Date();

    $scope.dateOptions = {formatYear: 'yy',startingDay: 1, 'class': 'datepicker' };
    $scope.timeOptions = {showMeridian:false};
    $scope.format ='dd/MM/yyyy HH:mm';
    $scope.today = function() {     $scope.dt = new Date();  };
    $scope.clear = function () {    $scope.dt = null;  };
    $scope.open2 = function($event) {  $scope.opened2 = true; };
    $scope.format2 ='dd/MM/yyyy';
    $scope.dateFormat = 'dd/MM/yyyy HH:mm';


    ////////////////////////


    $scope.Models = {};
    $scope.entityName = $rootScope.$stateParams.entityName;
    $scope.id = $rootScope.$stateParams.id;
    var id=$scope.id;
    var arrKey;
    var currentEntityName=$scope.entityName;

    for (var i = 0; i < data.entities.length ; i++) {
        if (data.entities[i].name === $scope.entityName) {
            arrKey = i;
            break;
        }
    }


    //Makes 'add a new' button dynamic
    $scope.entityTrName=data.entities[arrKey].name_tr;
    var trName=data.entities[arrKey].name_tr;
    var res= trName.split(' ');
    if(res.length>2){
        $scope.pageName=res[0]+' '+res[1];
    }else{
        $scope.pageName=res[0]
    }


    if(Object.keys(data.entities[arrKey].methods.detail).length>0)
    {
        //calls to API for detail of current data
        var queryParam= data.entities[arrKey].methods.view.query_params[0];
        var updateObject=angular.copy(data.entities[arrKey].methods.detail);
        updateObject.query_params=[];
        var token=localStorage.getItem('token');

        updateObject.query_params.push('id='+id);

        httpService.http(updateObject).then(function (dataEdit) {

            angular.forEach(data.entities[arrKey].fields, function (value){

                if(value.type=='component')
                {

                    angular.forEach(value.component_params.fields,function(compFields){

                        angular.forEach(dataEdit.result, function (valueRow, key){

                            if(compFields.param == key)
                            {
                                if(compFields.type == 'select')
                                {
                                    angular.forEach(compFields.value,function(selectItem){

                                        if(selectItem.value == valueRow){

                                            $scope.Models[compFields.param]=""+selectItem.key;
                                        }
                                    });
                                }
                                else
                                {
                                    $scope.Models[compFields.param]=valueRow;
                                }
                            }
                            else if(compFields.param == key + 'Id' || compFields.object_model.update == key+'Id')
                            {
                                $scope.Models[compFields.param]=dataEdit.result[key].id;
                            }

                        });


                    });


                }
                else
                {
                    angular.forEach(dataEdit.result, function (valueRow, key){

                        if(value.param == key)
                        {
                            if(value.type == 'select')
                            {
                                angular.forEach(value.value,function(selectItem){

                                    if(selectItem.value == valueRow){
                                        $scope.Models[value.param]=""+selectItem.key;
                                    }
                                });
                            }
                            else
                            {
                                $scope.Models[value.param]=valueRow;
                            }
                        }
                        else if(value.param == key + 'Id' || value.object_model.update == key+'Id')
                        {
                            $scope.Models[value.param]=dataEdit.result[key].id;
                        }

                    });
                }


            });
        });
    }else{
        //gets current data from view state (does not send a request)
        $scope.fieldList = data.entities[arrKey].fields;
        angular.forEach(data.entities[arrKey].fields, function (value){

            angular.forEach($rootScope.row, function (valueRow, key){
                if(value.type=='fk_select'){
                    if(value.param == key)
                    {
                        $scope.Models[value.param]=valueRow;
                    }
                }else{
                    if(value.object_model.update == key)
                    {
                        $scope.Models[value.param]=valueRow;
                    }
                }


            });
        });
    }


    $scope.fieldList = data.entities[arrKey].fields;


    $scope.validationOptions = {
        rules: {}
    };

    //Validation
    $scope.buildValidation = function (value){

        var masking = {};

        $scope.validationOptions.rules[value.param]={};


        // check if required
        if(value.is_required)
        {
            $scope.validationOptions.rules[value.param].required = true;
        }

        if(value.validation)
        {

            angular.forEach(value.validation,function(rule){
                $scope.validationOptions.rules[value.param][rule.item] = rule.value;


                if(rule.item == 'digits' && rule.value==true)
                {
                    masking.mask = "9{*}";
                }

                if(rule.item == 'length')
                {
                    if(masking.mask)
                    {
                        masking.mask = masking.mask.replace("{*}","{"+rule.value+"}");
                    }
                    else
                    {
                        masking.mask = "*";
                        masking.repeat = rule.value;
                    }

                }
                if(rule.item == 'minlength')
                {
                    if(masking.mask)   // if mask present, update
                    {
                        masking.mask = masking.mask.replace("{*}","{"+rule.value+",20}");
                    }
                    else   // form a mask
                    {
                        masking.mask = "*{"+rule.value+",*}";
                    }
                }
                if(rule.item == 'maxlength')
                {
                    if(masking.mask)   // if mask present, update
                    {
                        masking.mask = masking.mask.replace("{*}","{0,"+rule.value+"}");
                    }
                    else   // form a mask
                    {
                        masking.mask = "*{0,"+rule.value+"}";
                    }
                }
                if(rule.item == 'plate')
                {
                    masking.mask = "9{2}a{1,3}9{2,4}";
                }
                if(rule.item == 'datetime')
                {
                    masking = {};
                    masking.alias = 'datetime';
                }

            });
        }

        // give the mask for the field
        value.mask = masking;


    };



    angular.forEach(data.entities[arrKey].fields, function (value){


        if(value.component_params && value.component_params.fields)
        {
            angular.forEach(value.component_params.fields,function(subField){
                $scope.buildValidation(subField);
            })

        }
        else
        {
            $scope.buildValidation(value);
        }


        //////// binder conditions for edits //////////////


        if(value.type == 'component')
        {

            //////// component field lar için binder initialize

            $scope.isShown = false;

            if(angular.isArray(value.component_params.binder.condition))
            {
                var conditionCheck = true;
                var eachCondition = false;

                angular.forEach(value.component_params.binder.condition,function(condition){
                    eachCondition = ($scope.Models[condition.param] == condition.value);

                    $scope.$watch('Models.'+condition.param, function(newValue,oldValue) {

                        $scope.isShown = (newValue == condition.value);

                        if($scope.isShown) $scope.addComponent('extra_fields');


                    }, true);

                    conditionCheck = conditionCheck && eachCondition;
                });
            }
            $scope.isShown = conditionCheck;

        }

    });







    $scope.isArray = angular.isArray;


    //Fills the select boxes data
    $scope.fillOptions = function (field)
    {
        field.value = [];

        var deferred = $q.defer();

        var token=localStorage.getItem('token');


        field.fk_service.body_params={};
        field.fk_service.default_params='limit=-1&offset=0&orderBy=id&orderType=asc';

        httpService.http(field.fk_service).then(function (data){

            if(data.result.data)
            {
                angular.forEach(data.result.data,function(that){
                    var temp = {};
                    temp.key = that.id;
                    temp.value = that.name;
                    field.value.push(temp);

                });
            }
            else {
                angular.forEach(data.result,function(that){
                    var temp = {};
                    temp.key = that.id;
                    temp.value = that.name;
                    field.value.push(temp);
                });
            }

            deferred.resolve(data);
        });

        return deferred.promise;

    };

    //Adds a new component
    $scope.addComponent = function (param)
    {

        $state.go('app.update.component');

        angular.forEach(data.entities[arrKey].fields, function (value){

            if(value.param == param)
            {
                if(value.component_params.type == 'list' && value.is_create==true)
                {
                    angular.forEach($scope.componentParamsInitial[param].content, function (field){
                        value.component_params.fields.push(field);
                    });
                }
                else if(value.component_params.type == 'form' && value.is_create==true) {
                    angular.forEach($scope.componentParamsInitial[param].content, function (field){
                        value.component_params.fields.push(field);
                    });
                }
                else if(value.component_params.type == 'table' && value.is_create==true) {


                    var inputName;
                    var inputType;
                    angular.forEach($scope.componentParamsInitial[param].content, function (field){

                        if(field.type != 'fk_select')
                        {
                            inputName = field.param;
                            inputType = field.type;
                        }

                    });


                    angular.forEach($scope.componentParamsInitial[param].content, function (field){
                        if(field.type == 'fk_select')
                        {
                            var token=localStorage.getItem('token');


                            field.fk_service.body_params={};

                            $scope.fillOptions(field).then(function(e){

                                angular.forEach(e.result, function (options){

                                    var tempWrapObj = {};
                                    var tempArray = [];
                                    var tempObj  = angular.copy(fieldFormat);
                                    var tempObj2 =  angular.copy(fieldFormat);

                                    tempObj.param = field.param;
                                    tempObj.type = "label";
                                    tempObj.value = options.id;
                                    tempObj.label = options.name;

                                    tempObj2.param = inputName;
                                    tempObj2.type  = inputType;

                                    tempArray.push(tempObj);
                                    tempArray.push(tempObj2);

                                    tempWrapObj.data = tempArray;

                                    value.component_params.fields.push(tempWrapObj);
                                });


                            });
                        }

                    });

                }
            }
        });

    };


    //Updates data
    $scope.editData = function (form)
    {
        if(form.validate()){

            $scope.form={};

            angular.forEach(data.entities[arrKey].fields, function(value){

                if(value.type == 'component') {
                    if (value.component_params.type == 'form') {

                        if($scope.Models[value.component_params.binder.fields]) {
                            delete $scope.Models[value.component_params.binder.fields.value]; // binder'ın ng-modelini algılamaması ve post içinde göndermemesi için siliyoruz
                        }

                    }
                    else if (value.component_params.type == 'list') {

                        angular.forEach(value.component_params.fields, function (value, key) {

                            var temp = [];

                            angular.forEach($scope.Models[value.param], function (that) {
                                if (that)
                                    temp.push(that);
                            });
                            $scope.Models[value.param] = temp;

                        });

                    }
                    else if (value.component_params.type == 'table') {

                        angular.forEach(value.component_params.fields, function (value, key) {

                             var temp = [];

                             angular.forEach($scope.Models[value.param], function (that) {
                                 console.log(that);
                                 if (that)
                                     temp.push(that);
                             });
                             $scope.Models[value.param] = temp;

                         });

                    }
                }else if(value.type=='date' || value.type=='datetime'){

                    $scope.Models[value.param] = $filter('date')($scope.Models[value.param],'yyyy-MM-dd HH:mm:ss');

                }
            });

            $scope.form=$scope.Models;
            var dataUpdate=$scope.form;

            var updatePostObject=angular.copy(data.entities[arrKey].methods.update);

            updatePostObject.query_params=[];


            var token=localStorage.getItem('token');

            updatePostObject.body_params={};
            updatePostObject.body_params=dataUpdate;



            var currentEntity = data.entities[arrKey].name;
            httpService.http(updatePostObject).then(function (data){
                if(data.successful==true){
                    toastr['success']("Düzenleme Başarılı",{"closeButton": true,});

                    $state.go('app.view', { entityName: currentEntity});
                }else{
                    toastr['error']("Hata oluştu",{"closeButton": true,});
                }
            });

        }


    };


    $scope.goBack=function () {
        var currentEntity=data.entities[arrKey].name;
        $state.go('app.view', { entityName: currentEntity});
    }

});

//Login and Logout functions
app.controller('tokenController', function ($scope,$http,$rootScope, $state,tokenService,$q,httpService) {

    $scope.entityName = 'token';
    var arrKey;

    for (var i = 0; i < data.entities.length ; i++) {
        if (data.entities[i].name === $scope.entityName) {
            arrKey = i;
            break;
        }
    }

    //Login
    $scope.login=function () {

        var generateLoginObject=angular.copy(data.entities[arrKey].methods.create);
        generateLoginObject.body_params.username=$scope.user.email;
        generateLoginObject.body_params.password=$scope.user.password;

        tokenService.generate(generateLoginObject).then(function (data) {
           
        });
    };

    //Logout
    $scope.logout=function () {
        var generateLogoutObject=angular.copy(data.entities[arrKey].methods.delete);
        var token=localStorage.getItem('token');

        if(Object.keys(generateLogoutObject.body_params).length>0){
            generateLogoutObject.body_params={};
            generateLogoutObject.body_params.token=token;
        }else{
            generateLogoutObject.body_params={};
            generateLogoutObject.headers['Authorization']=token;
        }
        tokenService.logout(generateLogoutObject);
    }

});

//Left Menu Bar Controller
app.controller('leftBarController', function ($scope) {

    //Set the active class to left menu
    
    $scope.setActive = function(menuItem) {
        $scope.activeMenu = menuItem
    }
});