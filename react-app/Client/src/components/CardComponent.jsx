import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Checkbox, Input, Empty } from 'antd';

const courseData = [
  {
    key: '1',
    subjectName: 'การพัฒนาแอพพลิเคชั่นมือถือ',
    teacher: 'สมบูรณ์ กิจการ',
    status: 'เปิดรับสมัคร',
    testDate: '25 ชั่วโมง',
    timestart: 'วันที่ 12/11/2567',
    address: '3-5201',
    availableSlots: '50 คน',
    alreadySlots: '20 คน',
  },
  {
    key: '2',
    subjectName: 'การออกแบบและพัฒนาเว็บไซต์',
    teacher: 'ดวงใจ สุขสม',
    status: 'ปิดรับสมัคร',
    testDate: '30 ชั่วโมง',
    timestart: 'วันที่ 13/11/2567',
    address: '3-5504',
    availableSlots: '50 คน',
    alreadySlots: '50 คน',
  },
  {
    key: '3',
    subjectName: 'การสร้างเกมดิจิทัล',
    teacher: 'วีระศักดิ์ ลิ้ม',
    status: 'เปิดรับสมัคร',
    testDate: '20 ชั่วโมง',
    timestart: 'วันที่ 14/11/2567',
    address: '4-6501',
    availableSlots: '50 คน',
    alreadySlots: '20 คน',
  },
  {
    key: '4',
    subjectName: 'เทคโนโลยีบล็อกเชน',
    teacher: 'อรุณศักดิ์ จันทรา',
    status: 'เปิดรับสมัคร',
    testDate: '15 ชั่วโมง',
    timestart: 'วันที่ 15/11/2567',
    address: '5-4502',
    availableSlots: '50 คน',
    alreadySlots: '20 คน',
  },
  {
    key: '5',
    subjectName: 'ระบบปฏิบัติการคอมพิวเตอร์',
    teacher: 'ภัทราภรณ์ บูรณะ',
    status: 'ปิดรับสมัคร',
    testDate: '35 ชั่วโมง',
    timestart: 'วันที่ 16/11/2567',
    address: '6-3505',
    availableSlots: '50 คน',
    alreadySlots: '50 คน',
  },
  {
    key: '6',
    subjectName: 'การพัฒนาระบบคลาวด์',
    teacher: 'พิสิษฐ์ อัศวานันท์',
    status: 'เปิดรับสมัคร',
    testDate: '30 ชั่วโมง',
    timestart: 'วันที่ 17/11/2567',
    address: '7-6502',
    availableSlots: '50 คน',
    alreadySlots: '20 คน',
  },
  {
    key: '7',
    subjectName: 'การวิเคราะห์ข้อมูลขนาดใหญ่',
    teacher: 'สุภาวดี คำชำนาญ',
    status: 'ปิดรับสมัคร',
    testDate: '40 ชั่วโมง',
    timestart: 'วันที่ 18/11/2567',
    address: '8-7201',
    availableSlots: '50 คน',
    alreadySlots: '50 คน',
  },
  {
    key: '8',
    subjectName: 'ปัญญาประดิษฐ์ในธุรกิจ',
    teacher: 'ศิริพร บุญพาน',
    status: 'เปิดรับสมัคร',
    testDate: '20 ชั่วโมง',
    timestart: 'วันที่ 19/11/2567',
    address: '9-6501',
    availableSlots: '50 คน',
    alreadySlots: '20 คน',
  },
  {
    key: '9',
    subjectName: 'การออกแบบประสบการณ์ผู้ใช้',
    teacher: 'มานิตา รุ่งเรือง',
    status: 'เปิดรับสมัคร',
    testDate: '25 ชั่วโมง',
    timestart: 'วันที่ 20/11/2567',
    address: '10-4203',
    availableSlots: '50 คน',
    alreadySlots: '20 คน',
  },
  {
    key: '10',
    subjectName: 'การพัฒนาแอปพลิเคชัน IoT',
    teacher: 'จิราพร พงศ์สุข',
    status: 'ปิดรับสมัคร',
    testDate: '15 ชั่วโมง',
    timestart: 'วันที่ 21/11/2567',
    address: '11-5205',
    availableSlots: '50 คน',
    alreadySlots: '50 คน',
  },
  {
    key: '11',
    subjectName: 'การพัฒนาผลิตภัณฑ์ดิจิทัล',
    teacher: 'รุ่งโรจน์ แสงยุติธรรม',
    status: 'เปิดรับสมัคร',
    testDate: '30 ชั่วโมง',
    timestart: 'วันที่ 22/11/2567',
    address: '12-5104',
    availableSlots: '50 คน',
    alreadySlots: '20 คน',
  },
  {
    key: '12',
    subjectName: 'การจัดการระบบฐานข้อมูล',
    teacher: 'อมรินทร์ ปกรณ์',
    status: 'เปิดรับสมัคร',
    testDate: '25 ชั่วโมง',
    timestart: 'วันที่ 23/11/2567',
    address: '13-4502',
    availableSlots: '50 คน',
    alreadySlots: '20 คน',
  },
];

const App = ({ viewMode }) => {
  const [courses, setCourses] = useState(courseData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showClosedOnly, setShowClosedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [randomCourse, setRandomCourse] = useState(null);

  const handleOpenModal = (course) => {
    setSelectedCourse(course);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedCourse(null);
  };

  const handleConfirmRegistration = () => {
    setCourses(courses.filter(course => course.key !== selectedCourse.key));
    setIsModalVisible(false);
    setSelectedCourse(null);
  };

  const handleFilterChange = (e, filterType) => {
    if (filterType === 'open') {
      setShowOpenOnly(e.target.checked);
      setShowClosedOnly(false);
    } else if (filterType === 'closed') {
      setShowClosedOnly(e.target.checked);
      setShowOpenOnly(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleModalEnter = (e) => {
    if (e.key === 'Enter') {
      handleConfirmRegistration(); // Trigger the "ยืนยัน" button action when Enter is pressed
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isModalVisible && e.key === 'Enter') {
        handleConfirmRegistration(); // Trigger the "ยืนยัน" button action when Enter is pressed
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    // Clean up the event listener when the component unmounts or modal visibility changes
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isModalVisible, selectedCourse]);

  useEffect(() => {
    if (viewMode === 'single') {
      const availableCourses = courses.filter(course => course.status === 'เปิดรับสมัคร');
      const randomIndex = Math.floor(Math.random() * availableCourses.length);
      setRandomCourse(availableCourses[randomIndex]);
    }
  }, [viewMode, courses]);

  const filteredCourses = courses
    .filter(course => {
      if (showOpenOnly) return course.status === 'เปิดรับสมัคร';
      if (showClosedOnly) return course.status === 'ปิดรับสมัคร';
      return true;
    })
    .filter(course => {
      return (
        course.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.testDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.timestart.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  return (
    <>
      {viewMode !== "single" && (
        <div style={{ marginBottom: '20px' }}>
          <Input
            placeholder="ค้นหาหลักสูตร"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ marginBottom: '10px', width: '300px' }}
          />
          <div>
            <Checkbox
              checked={showOpenOnly}
              onChange={(e) => handleFilterChange(e, 'open')}
            >
              แสดงเฉพาะ ลงทะเบียน
            </Checkbox>
            <Checkbox
              checked={showClosedOnly}
              onChange={(e) => handleFilterChange(e, 'closed')}
              style={{ marginLeft: '10px' }}
            >
              แสดงเฉพาะ เต็ม
            </Checkbox>
          </div>
        </div>
      )}

      {filteredCourses.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', width: '150vh' }}>
          <Empty description="No data available" />
        </div>
      ) : viewMode === "single" ? (
        <Row gutter={[16, 16]} justify="center">
          <Col
            key={randomCourse?.key}
            xs={24} sm={12} md={8} lg={6} xl={6}
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Card
              className="slide-up"
              title={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: '10px',
                  }}
                >
                  <span style={{ marginRight: '10px', textAlign: 'center' }}>
                    {randomCourse?.subjectName}
                  </span>
                </div>
              }
              style={{
                width: '100%',
                maxWidth: '400px',
                minWidth: '350px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <img
                  src="https://via.placeholder.com/150"
                  alt="example"
                  style={{ borderRadius: '50%', width: '100px', height: '100px' }}
                />
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span><strong>ชื่อผู้สอน:</strong> {randomCourse?.teacher}</span>
                  <span style={{ textAlign: 'left' }}>
                    <strong>สถานะ:</strong> <span style={{ color: randomCourse?.status === 'เปิดรับสมัคร' ? 'green' : 'red' }}>{randomCourse?.status}</span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span><strong>ชั่วโมงเรียน:</strong> {randomCourse?.testDate}</span>
                  <span><strong>จำนวนที่เปิดรับ:</strong> {randomCourse?.availableSlots}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span><strong>วันที่เรียน:</strong> {randomCourse?.timestart}</span>
                  <span><strong>ลงทะเบียนแล้ว:</strong> {randomCourse?.alreadySlots}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>สถานที่เรียน:</strong> {randomCourse?.address}</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCourses.map((course) => (
            <Col
              key={course.key}
              xs={24} sm={12} lg={6} xl={6}
              style={{
                display: 'flex',
              }}
            >
              <Card
                className="slide-up"
                style={{ width: '500px', height: '330px' }}
                title={
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ marginRight: '5px' }}>{course.subjectName}</span>
                    <Button
                      type="primary"
                      onClick={() => handleOpenModal(course)}
                      style={{
                        fontSize: '14px',
                        height: '30px',
                        backgroundColor: course.status === 'เปิดรับสมัคร' ? 'white' : 'red',
                        borderColor: course.status === 'เปิดรับสมัคร' ? 'green' : 'red',
                        color: course.status === 'เปิดรับสมัคร' ? 'green' : 'white',
                      }}
                      disabled={course.status === 'ปิดรับสมัคร'}
                    >
                      {course.status === 'ปิดรับสมัคร' ? 'เต็ม' : 'ลงทะเบียน'}
                    </Button>
                  </div>
                }
                bordered={false}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <img
                    src="https://via.placeholder.com/150"
                    alt="example"
                    style={{ borderRadius: '50%', width: '100px', height: '100px' }}
                  />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span><strong>ชื่อผู้สอน:</strong> {course.teacher}</span>
                    <span style={{ textAlign: 'left' }}><strong>สถานะ:</strong> <span style={{ color: course.status === 'เปิดรับสมัคร' ? 'green' : 'red' }}>{course.status}</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span><strong>ชั่วโมงเรียน:</strong> {course.testDate}</span>
                    <span><strong>จำนวนที่เปิดรับ:</strong> {course.availableSlots}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span><strong>วันที่เรียน:</strong> {course.timestart}</span>
                    <span><strong>ลงทะเบียนแล้ว:</strong> {course.alreadySlots}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>สถานที่เรียน:</strong> {course.address}</span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="ยืนยันการลงทะเบียน"
        visible={isModalVisible}
        onOk={handleConfirmRegistration}
        onCancel={handleCloseModal}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        cancelButtonProps={{
          style: { backgroundColor: 'red', borderColor: 'red', color: 'white' },
        }}
        okButtonProps={{
          style: { backgroundColor: 'green', borderColor: 'green', color: 'white' },
        }}
      >
        <p>คุณต้องการลงทะเบียนในคอร์ส "<strong>{selectedCourse?.subjectName}</strong>" หรือไม่?</p>
      </Modal>
    </>
  );
};

export default App;
