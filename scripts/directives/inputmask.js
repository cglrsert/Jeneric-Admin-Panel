/*
'use strict';
*/
/**
 * @ngdoc directive
 * @name minovateApp.directive:inputmask
 * @description
 * # inputmask
 */

/*
app
  .directive('inputmask', function() {
        return {
            restrict: 'AC',
            link: function (scope, el, attrs) {
            el.inputmask(scope.$eval(attrs.inputMask));
            el.on('change', function() {
                scope.$eval(attrs.ngModel + "='" + el.val() + "'");
                console.log('değişti');
                // or scope[attrs.ngModel] = el.val() if your expression doesn't contain dot.
            });
            }
        };
  });


*/
(function(){
    'use strict';
    var directiveId = 'inputMask';
    app.directive(directiveId, function() {
        return {
            restrict: 'AC',
            link: function (scope, el, attrs) {
                el.inputmask(scope.$eval(attrs.inputMask));
                el.on('change', function() {
                    scope.$eval(attrs.ngModel + "='" + el.val() + "'");
                    // or scope[attrs.ngModel] = el.val() if your expression doesn't contain dot.
                });
            }
        }
    });
})();