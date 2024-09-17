import fs from 'fs'
import path from 'path'

const config_path = path.join(__dirname,'app.config.json')

export type AppConfig = {
  init_data : boolean
}

async function createConfigNotExist() {
  console.log(config_path)
  if(!fs.existsSync(config_path)) {
    const config = {
      init_data : false
    }
    const parse = JSON.stringify(config, null, 2)
    const file = await createFile(config_path, parse)
    return file
  }

  return config_path
}

async function createFile(name : string, content : string) {
  return new Promise<string>((resolve, reject) => {
    fs.writeFile(name, content, (err) => {
      if(err) reject(err);
      resolve(name)
    })
  })
}

export async function openConfigFile() {
  return new Promise<AppConfig>(async (resolve, reject) => {
    const file = await createConfigNotExist()
    fs.readFile(file, 'utf-8', (err, content) => {
      if(err) reject(err)
      resolve(JSON.parse(content))
    })
  })  
}

export async function updateConfigFile(config : AppConfig) {
  const parse = JSON.stringify(config, null, 2)
  return new Promise<boolean>((res, rej) => {
    fs.writeFile(config_path, parse, (err) => {
      if(err) rej(err);
      res(true)
    })
  })
}