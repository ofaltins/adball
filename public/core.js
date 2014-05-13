// public/core.js
var adBall = angular.module('adBall', []);

function mainController($scope, $http) {
	$scope.formData = {};

	// when landing on the page, get all matches and show them
	$http.get('/api/players')
		.success(function(data) {
			$scope.matches = data.matches
			$scope.players = data.players;
			console.log(data.matches);
			
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
		
			

	// when submitting the add form, send the text to the node API
	$scope.createMatch = function() {
		
		$http.post('/api/matches', $scope.formData)
			.success(function(data) {
				$scope.formData = {}; // clear the form so our user is ready to enter another
				$scope.matches = data.matches
				$scope.players = data.players;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

}

