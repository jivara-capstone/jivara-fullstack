const res = await fetch('http://localhost:3001/api/v1/auth/login', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({email:'superadmin@jivara.test', password:'Demo12345'})});
console.log(res.status, await res.text());
