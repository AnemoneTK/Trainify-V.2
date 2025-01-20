import Schedulecomponent from "../../../components/Schedulecomponent";
export default function schedule() {

  

  return (
    <div className="w-full flex flex-col gap-[1rem] h-screen">
      <div className="text-2xl font-bold mb-2">ตารางเรียน</div>
      <div style={{width:'1450px'}} className=" flex-col  md:flex-row gap-[1rem] w-full ">
          <Schedulecomponent/>
      </div>
    </div>
  );
}
