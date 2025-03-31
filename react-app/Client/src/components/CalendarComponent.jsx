import { useState } from "react";
import React, { useEffect } from 'react';
import { Calendar, Badge, List, Modal, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";

const CalendarLocale = {
  sunday: "อา",
  monday: "จ",
  tuesday: "อ",
  wednesday: "พ",
  thursday: "พฤ",
  friday: "ศ",
  saturday: "ส",
  ok: "ตกลง",
  today: "วันนี้",
  yesterday: "เมื่อวาน",
  hours: "ชั่วโมง",
  minutes: "นาที",
  seconds: "วินาที",
  formattedMonthPattern: "MMMM yyyy",
  formattedDayPattern: "dd MMMM yyyy",
  shortDateFormat: "dd/MM/yyyy",
  shortTimeFormat: "HH:mm",
};

export default function CalendarComponent() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalContent, setModalContent] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  function getTodoList(date) {
    if (!date) return [];

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    // แปลงวันที่เป็นรูปแบบ YYYY-MM-DD
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    switch (formattedDate) {
      case "2024-10-08":
        return [
          { time: "10:30 น.", title: "การประชุม" },
          { time: "12:00 น.", title: "พักรับประทานอาหาร" },
        ];
      case "2024-10-10":
        return [
          { time: "09:30 น.", title: "ประชุมแนะนำผลิตภัณฑ์" },
          { time: "12:30 น.", title: "รับรองลูกค้า" },
          { time: "14:00 น.", title: "หารือเรื่องการออกแบบผลิตภัณฑ์" },
          { time: "17:00 น.", title: "ทดสอบและตรวจรับผลิตภัณฑ์" },
          { time: "18:30 น.", title: "รายงานผล" },
        ];
      default:
        return [];
    }
  }

  const renderCell = (date) => {
    const list = getTodoList(date);
    if (list.length) {
      return <Badge className="calendar-todo-item-badge" />;
    }
    return null;
  };

  const handleSelect = (date) => {
    const todoList = getTodoList(date);
    if (todoList.length > 0) {
      setModalContent(todoList);
      setModalOpen(true);
    }
    setSelectedDate(date);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  const handleAnimationEnd = () => {
    setIsAnimationDone(true);
  };

  useEffect(() => {
    const tableWrapper = document.querySelector('.table-container');
    if (tableWrapper) {
      tableWrapper.style.overflowX = 'hidden';
    }
  }, []);

  return (
    <>
      <div className="flex flex-col gap-2 lg:flex-row ">
        <div className="w-full flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center relative w-full">
            <div className="text-2xl ">กำหนดการนัดหมาย</div>
            <div className="font-normal">
              คลิกที่ วัน เพื่อดูรายละเอียดเพิ่มเติม
            </div>
          </div>
          <Calendar
            compact
            renderCell={renderCell}
            onSelect={handleSelect}
            locale={CalendarLocale}
          />
        </div>
      </div>
      <Modal open={modalOpen} onClose={handleCloseModal} centered>
        <Modal.Header>
          <Modal.Title>
            รายละเอียดวันที่{" "}
            {selectedDate &&
              `${selectedDate.getDate()} ${selectedDate.toLocaleString(
                "th-TH",
                { month: "long" }
              )} ${selectedDate.getFullYear() + 543}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <List className="px-5">
            {modalContent.map((item) => (
              <List.Item
                key={item.time}
                style={{ width: "100%", border: "none" }}
              >
                <div>{item.time}</div>
                <div>{item.title}</div>
              </List.Item>
            ))}
          </List>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCloseModal} appearance="primary">
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
