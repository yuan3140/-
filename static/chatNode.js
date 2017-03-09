angular.module('chatApp', []);

// 创建socket服务
angular.module('chatApp').factory('socket', function($rootScope) {
    var socket = io.connect('/');
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args)
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.call(socket, args);
                    }
                });
            });
        }
    }
});

angular.module('chatApp').controller('roomCtrl', function($scope, socket) {
    socket.on('messages.read', function(messages) {
        $scope.messages = messages;
    })
    socket.on('messages.add', function(message) {
        $scope.messages.push(message);
    })
    socket.emit('messages.read');
});

angular.module('chatApp').controller('messageCreatorCtrl', function($scope, socket) {
    $scope.createMessage = function() {
        socket.emit('messages.create', $scope.newMessage);
        $scope.newMessage = '';
    }
});

angular.module('chatApp').directive('ctrlEnterBreakLine', function() {
    return function(scope, element, attrs) {
        var ctrlDown = false;
        element.bind('keydown', function(evt) {
            if (evt.which === 17) {
                ctrlDown = true;
            }
            setTimeout(function() {
                ctrlDown = false;
            }, 1000);

            if (evt.which === 13) {
                if (ctrlDown) {
                    element.val(element.val() + '\n');
                } else {
                    scope.$apply(function() {
                        scope.$eval(attrs.ctrlEnterBreakLine);
                    });
                    evt.preventDefault();
                }
            }
        })
    }
});

angular.module('chatApp').directive('autoScrollToBottom', function() {
	return {
		link: function(scope, element, attrs) {
			scope.$watch(
				function() {
					return element.children().length;
				},
				function() {
					return element.animate({
						scrollTop: element.prop('scrollHeight')
					}, 1000)
				}
			)
		}
	}
})
