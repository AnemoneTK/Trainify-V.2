import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Modal } from 'antd';

const targetDate = new Date('2024-11-12T23:59:59'); // End of 10/11/2024

const initialDataSource = [
  {
    key: '1',
    subjectName: 'การพัฒนาโปรแกรมส่วนหลัง',
    subjectCode: 'CSI401',
    sectionsubject: '001',
    teacher: 'เมธัส คำจาด',
    Timesubject: 'วันจันทร์ 09:00 - 10:40',
    testtime: 'ไม่จัดสอบ'
  },
  {
    key: '2',
    subjectName: 'การวิเคราะห์ข้อมูล',
    subjectCode: 'CSI402',
    sectionsubject: '011',
    teacher: 'สิริรัตน์ มัชฌิมาดิลก',
    Timesubject: 'วันอาทิตย์ 09:00 - 12:40',
    testtime: 'ไม่จัดสอบ'
  },
  {
    key: '3',
    subjectName: 'การเรียนรู้ของเครื่อง',
    subjectCode: 'CSI403',
    sectionsubject: '008',
    teacher: 'ชัชวาลย์ วรวิทย์รัตนกุล',
    Timesubject: 'วันพุธ 12:00 - 14:40',
    testtime: 'ไม่จัดสอบ'
  },
  {
    key: '4',
    subjectName: 'การพัฒนาแอพพลิเคชั่นมือถือ',
    subjectCode: 'CSI404',
    sectionsubject: '001',
    teacher: 'สมบูรณ์ กิจการ',
    Timesubject: 'วันจันทร์ 10:00 - 12:00',
    testtime: 'ไม่จัดสอบ'
  },
  {
    key: '5',
    subjectName: 'การออกแบบและพัฒนาเว็บไซต์',
    subjectCode: 'CSI405',
    sectionsubject: '002',
    teacher: 'ดวงใจ สุขสม',
    Timesubject: 'วันอังคาร 13:00 - 15:00',
    testtime: 'ไม่จัดสอบ'
  }
];

const App = ({ showActions = true }) => {
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [dataSource, setDataSource] = useState(initialDataSource);

  const handleAnimationEnd = () => {
    setIsAnimationDone(true);
  };

  const handleCancelRegistration = (key) => {
    setSelectedKey(key);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedKey(null);
  };

  const handleModalConfirm = () => {
    setDataSource(dataSource.filter(item => item.key !== selectedKey));
    setIsModalVisible(false);
    setSelectedKey(null);
  };

  const mainColumns = [
    { title: 'ชื่อวิชา', dataIndex: 'subjectName', key: 'subjectName', align: 'left' },
    { title: 'รหัสวิชา', dataIndex: 'subjectCode', key: 'subjectCode', align: 'center' },
    { title: 'กลุ่มเรียน', dataIndex: 'sectionsubject', key: 'sectionsubject', align: 'center' },
    { title: 'อาจารย์ผู้สอน', dataIndex: 'teacher', key: 'teacher', align: 'left' },
    { title: 'เวลาเรียน', dataIndex: 'Timesubject', key: 'Timesubject', align: 'left' },
    { title: 'วันที่สอบ', dataIndex: 'testtime', key: 'testtime', align: 'center' },
    ...(showActions ? [
      {
        title: 'Action',
        key: 'operation',
        align: 'center',
        render: (_, record) => {
          const currentDate = new Date();
          if (currentDate <= targetDate) {
            return (
              <Space size="middle" style={{ display: 'flex', justifyContent: 'center' }}>
                <Button type="primary" disabled>
                  ไม่สามารถยกเลิกการลงทะเบียนได้
                </Button>
              </Space>
            );
          } else {
            return (
              <Space size="middle" style={{ display: 'flex', justifyContent: 'center' }}>
                <Button style={{ backgroundColor: 'red', color: 'white' }} onClick={() => handleCancelRegistration(record.key)}>
                  ยกเลิกการลงทะเบียน
                </Button>
              </Space>
            );
          }
        },
      }
    ] : []),
  ];

  useEffect(() => {
    const tableWrapper = document.querySelector('.table-container');
    if (tableWrapper) {
      tableWrapper.style.overflowX = 'hidden';
    }
  }, []);

  return (
    <>
      <Table
        columns={mainColumns}
        dataSource={dataSource}
        style={{ width: '1450px', height: '600px' }}
        pagination={false}
      />
      <Modal
        title="ยืนยันการยกเลิกการลงทะเบียน"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel} style={{ backgroundColor: 'red', color: 'white' }}>
            ยกเลิก
          </Button>,
          <Button key="confirm" type="primary" onClick={handleModalConfirm} style={{ backgroundColor: 'green', color: 'white' }}>
            ยืนยัน
          </Button>,
        ]}
      >
        <p>คุณต้องการยกเลิกการลงทะเบียนใช่ไหม?</p>
      </Modal>
    </>
  );
};

export default App;
