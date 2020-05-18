var f5 = require('f5-nodejs');
var dns = require('dns');
//var net = require('net');
var server = new f5.ILXServer();

var NXDOMAIN_FAIL = "NXDOMAIN/SERVER FAIL";

// set DNS server
dns.setServers(['10.1.10.50']);

function isValidDomain(value) {
    
    // base on https://www.ietf.org/rfc/rfc1035.txt, the domain name should not lager than 253
    if(value === null || value.length > 253 || value.length <= 1) {
        return false;
    }
    
    if (typeof value !== 'string') {
        return false;
    }
    
    // TBD, add TLD, SLD, subdomain, wildcard validation
    
    return true;
    
}

function resolveCname(hostname, res) {
    
    dns.resolveCname(hostname, function(err, ret){
       if (err){
           res.reply(err.stack);
       } else {
           resolveACname(String(ret), res);
       }
   });
}

function resolveACname(hostname, res) {
    console.log("enter resolve ACname: " + hostname);
    dns.resolve(hostname, function (err, addresses){
          if(err) {
              // A record resove failed, will thought record is CNAME
              resolveCname(hostname, res);
          } else {
              res.reply(addresses);
          }
      });
}

server.addMethod("dnsResolve", function(req, res) {
    
  var hostname = req.params()[0];
  var rrtype = req.params()[1];
  
  // validation
  if(!isValidDomain(hostname)) {
      res.reply(NXDOMAIN_FAIL);
  }
  
  if(rrtype === null) {
      resolveACname(hostname, res);
  } else {
      //recommend way is to set cname from client
      dns.resolve(hostname, rrtype, function (err, addresses){
          if(err) {
              res.reply(err.stack);
          } else {
              res.reply(addresses);
          }
      });
  }

});

server.listen();
