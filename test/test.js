
var expect=require('chai').expect;
var supertest=require('supertest');
api=supertest('http://localhost:3001');

describe('Registeration Tests',function(){
  it('should return registration page',function(done){
    api.get('/register')
    .end(function(err,res){
      expect(res.statusCode).to.equal(200);
      done();
    });
  });
  it('should not register if userName exists',function(done){
    api.post('/register')
    .send({
          userName:'Gaurav',
          password:'123',
          email:'gaurav@gmail.com',
          phone:'934566171'
      })
      .end(function(err,res){
        expect(res.header.location).to.be.equal('/register');
        expect(res.statusCode).to.equal(302);
        done();
      });
  });
  it('should register new user if userName does not exists',function(done){
    api.post('/register')
    .send({
          userName:'Sanchit',
          password:'123',
          email:'sanchit@gmail.com',
          phone:'934566171'
      })
      .end(function(err,res){
        expect(res.header.location).to.be.equal('/login');
        expect(res.statusCode).to.equal(302);
        done();
      });
  });
});
