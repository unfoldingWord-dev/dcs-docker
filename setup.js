const fs = require("fs")
const path = require("path")
const readline = require("readline");

const templateFile = path.join(__dirname, "docker-compose.yaml.example")
const dockerComposeFile = path.join(__dirname, "docker-compose.yaml")

if( path.exists(dockerComposeFile) ){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

x1fs.copyFile(templateFile, dockerComposeFile, function(err) {
  if (err) {
    throw err
  } else {
    console.log("Successfully copied and moved the file!")
  }
})
