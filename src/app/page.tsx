import Scanner from '@/components/Scanner';
import { AppConfig, openConfigFile, updateConfigFile } from '@/server/config';
import { init_local_data } from '@/server/data';
import { unstable_noStore as noStore } from 'next/cache';
import 'react-toastify/dist/ReactToastify.css';
// import 'react-toastify/ReactToastify.css'
export default async function Home() {
  noStore()
  try {
    const config_file = await openConfigFile()
    if(!config_file.init_data) {
      const temp: AppConfig = {...config_file, init_data : true}
      const successInit = await init_local_data()
      if(successInit) {
        await updateConfigFile(temp)
      }
    }
  } catch (error) {
    console.log(error)
    return (
      <div>
        Initialization failed
      </div>
    )
  }
  return (
    <div>
      <Scanner />
    </div>
  );
}
