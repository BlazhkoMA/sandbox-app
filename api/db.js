

async function index(params) {
  const fs = require('fs')
  const path = require('path')
  await fs.writeFile(path.join(__dirname, '..','static', 'db.json'), JSON.stringify(params), function(error){
    if(error) throw error; // если возникла ошибка
  });

  return true;
}

export { index };
