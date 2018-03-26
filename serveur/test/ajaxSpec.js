const supertest = require("supertest");
const server = supertest.agent("http://projetchat.com:80");
var routesGet = ['/','/login','/disconnection','/accueil','/interface','/profil','/administration','/recoveListeAdmin','/403','/404','/500'];
var routesPost = ['/register','/connection','/updateAdmin','/updateAdminPassword','/statusAdmin','/actuAdmin','/updateClient','/dashboardConvers','/dashboardNote','/dashboardConversDeux','/removeAdmin','/editAdmin','/adminOfClient','/insert','/insertAdmin','/updateClientConvers','/checkConvers','/searchLastConvers','/tchatHistory','/transferConvers','/addCommentaire','/statsClient','/updateNote'];
// UNIT test begin
describe("Route test",function(){
	describe('#route get', function(){	
		var p = 0;
		for(var i=0; i<routesGet.length; i++){	
			it("should return "+routesGet[i],function(done){
				server
				.get(routesGet[p])
				.expect("Content-type",/json/)
				.expect(200)
				.end(function(err,res){
				console.log(res.status);
				done();
				});
				p++;
			});
		}
	})
	describe('route post', function(){
		var p = 0;
		for(var i=0; i<routesPost.length; i++){
			it("should return "+routesPost[i],function(done){
				server
				.post(routesPost[p])
				.expect("Content-type",/json/)
				.expect(200)
				.end(function(err,res){
				console.log(res.status);
				done();
				});
				p++;
			});
		}
	})
	describe('route test post', function(){
		it('should return register', function(done){
			server
			.post('/register')
			.field('email', 'shinomaki@gmail.com')
			.field('password', 'azerty')
			.field('name', 'shinomaki')
			.field('role', 'operateur')
			.expect("Content-type",/json/)
			.expect(200)
			.end(function(err,res){
			console.log(res.status);
			done();
			});
		})
		it('should return connection', function(done){
			server
			.post('/connection')
			.field('email', 'shinomaki@gmail.com')
			.field('password', 'azerty')
			.expect("Content-type",/json/)
			.expect(200)
			.end(function(err,res){
			console.log(res.status);
			done();
			});
		})
	})
});