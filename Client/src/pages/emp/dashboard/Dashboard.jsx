import CalendarComponent from "../../../components/CalendarComponent";
import { Card } from "antd";
import CardComponent from "../../../components/CardComponent";
import { useState, useEffect } from 'react';

export default function Dashboard() {

  
  useEffect(() => {
    const tableWrapper = document.querySelector('.table-container');
    if (tableWrapper) {
      tableWrapper.style.overflowX = 'hidden';
    }
  }, []);



  return (
    <div className="w-full flex flex-col gap-[1rem] h-screen">
      <div className="text-2xl font-bold mb-2">ตารางเรียน</div>
      <div className="flex flex-col  md:flex-row gap-[1rem] w-full ">
          <div className=" lg:w-auto h-full" style={{ maxWidth: '400px' }}>
            <Card
              title="แนะนำหลักสูตร"
              extra={<a href="/courseadd">หลักสูตรทั้งหมด</a>}
              bordered={false}
              className="h-full"
              style={{ width: '100%', maxWidth: '400px' }} // Ensure the card takes a fixed width of 400px
            >
              {/* CardComponent that fills the parent Card size */}
              <CardComponent
                viewMode="single"
                style={{
                  width: '100%',   // Make it take full width of the parent Card
                  height: '100%',  // Make it take full height of the parent Card
                  display: 'flex', // Use flexbox to make it responsive
                  flexDirection: 'column', // Ensure items inside flex in column (if needed)
                }}
              />
            </Card>
          </div>

          {/* Calendar Component */}
          <div
            className="flex flex-col items-center justify-center py-5 pr-2 w-full bg-white rounded-md"
            style={{
              minWidth: '320px',
              maxWidth: '800px', // Set the CalendarComponent to 400px width
            }}
          >
            <CalendarComponent />
          </div>

        <Card style={{ minWidth: '320px', maxwidth: '500px' }} className={`slide-in-table ${isAnimationDone ? '' : 'no-scroll'}w-1/3 h-full`}>
          <div className="flex flex-col items-start justify-between h-full gap-6">
            <div className="flex flex-col gap-1 flex-1">
              <div className="text-lg font-normal">หลักสูตรที่เปิดรับ</div>
              <div className="text-[3rem] font-bold p-0 leading-10 text-employee">
                8
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="text-lg font-normal">หลังสูตรที่ลง</div>
              <div className="text-[3rem] font-bold p-0 leading-10 text-employee">
                5
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="text-lg font-normal">หลักสูตรที่เต็มแล้ว</div>
              <div className="text-[3rem] font-bold p-0 leading-10 text-employee">
                4
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="text-lg font-normal">หลักสูตรยอดนิยม</div>
              <div className="text-[3rem] font-bold p-0 leading-10 text-employee">
                3
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="h-[80dvh] ">
        <Card
          title="คอร์สของฉัน"
          extra={<a href="/mycourse">ดูทั้งหมด</a>}
          className="w-full h-full rounded-md"
          style={{ minHeight: "400px", maxWidth: "100%", overflow: "hidden" }}
        >
          <div className="overflow-x-auto">
           
          </div>
        </Card>
      </div>
    </div >
  );
}
