import React from 'react';
import { Badge, Table } from 'antd';

const dayColorMap = {
    'วันจันทร์': '#ebe31c', 
    'วันอังคาร': '#fbadc7',
    'วันพุธ': '#21af4b', 
    'วันพฤหัสบดี': '#fd740c',
    'วันศุกร์': '#C085FF', 
    'วันเสาร์': '#a247a4', 
    'วันอาทิตย์': '#e91c23', 
};

const dataSource = [
    {
        key: '1',
        name: 'วันอาทิตย์',
        expandDataSource: [
            {
                key: '1-1',
                date: '09:00-10:40',
                name: 'การพัฒนาโปรแกรมส่วนหลัง',
                group: '001',
                address: 'อาคาร 5 - สยามบรมราชกุมารี',
                room: '05-0606',
                teacher: 'เมธัส คำจาด',
            },
            {
                key: '1-2',
                date: '11:00-12:40',
                name: 'การพัฒนาโปรแกรมส่วนหลัง',
                group: '001',
                address: 'อาคาร 5 - สยามบรมราชกุมารี',
                room: '05-0606',
                teacher: 'เมธัส คำจาด',
            }
        ]
    },
    {
        key: '2',
        name: 'วันจันทร์',
        expandDataSource: [
            {
                key: '2-1',
                date: '08:00-09:40',
                name: 'การเขียนโปรแกรมเชิงวัตถุ',
                group: '002',
                address: 'อาคาร 3 - ศรีปทุม',
                room: '03-0402',
                teacher: 'ดร.สมชาย สุขดี',
            },
            {
                key: '2-2',
                date: '10:00-11:40',
                name: 'โครงสร้างข้อมูล',
                group: '002',
                address: 'อาคาร 4 - ศรีปทุม',
                room: '04-0503',
                teacher: 'สุนทร สถาพร',
            }
        ]
    },
    {
        key: '3',
        name: 'วันอังคาร',
        expandDataSource: [
            {
                key: '3-1',
                date: '13:00-14:40',
                name: 'ระบบฐานข้อมูล',
                group: '003',
                address: 'อาคาร 6 - ศรีปทุม',
                room: '06-0701',
                teacher: 'กาญจนา เรืองเดช',
            },
            {
                key: '3-2',
                date: '15:00-16:40',
                name: 'การพัฒนาเว็บ',
                group: '003',
                address: 'อาคาร 7 - ศรีปทุม',
                room: '07-0802',
                teacher: 'อาจารย์จิราภา วิสุทธิ์',
            }
        ]
    },
    {
        key: '4',
        name: 'วันพุธ',
        expandDataSource: [
            {
                key: '4-1',
                date: '08:00-09:40',
                name: 'การจัดการโครงการ',
                group: '004',
                address: 'อาคาร 2 - ศรีปทุม',
                room: '02-0305',
                teacher: 'ณรงค์ ศิริกุล',
            },
            {
                key: '4-2',
                date: '10:00-11:40',
                name: 'หลักการเขียนโปรแกรม',
                group: '004',
                address: 'อาคาร 3 - ศรีปทุม',
                room: '03-0404',
                teacher: 'ดร.ธนิต สุขยิ่ง',
            }
        ]
    },
    {
        key: '5',
        name: 'วันพฤหัสบดี',
        expandDataSource: [
            {
                key: '5-1',
                date: '09:00-10:40',
                name: 'ระบบปฏิบัติการ',
                group: '005',
                address: 'อาคาร 4 - ศรีปทุม',
                room: '04-0507',
                teacher: 'สมพร บุญมา',
            },
            {
                key: '5-2',
                date: '13:00-14:40',
                name: 'ความปลอดภัยของข้อมูล',
                group: '005',
                address: 'อาคาร 6 - ศรีปทุม',
                room: '06-0606',
                teacher: 'นรินทร์ แสงจันทร์',
            }
        ]
    },
    {
        key: '6',
        name: 'วันศุกร์',
        expandDataSource: [
            {
                key: '6-1',
                date: '10:00-11:40',
                name: 'ระบบสารสนเทศเพื่อการจัดการ',
                group: '006',
                address: 'อาคาร 5 - ศรีปทุม',
                room: '05-0503',
                teacher: 'ปรีชา ชัยวัฒน์',
            },
            {
                key: '6-2',
                date: '12:00-13:40',
                name: 'ปัญญาประดิษฐ์เบื้องต้น',
                group: '006',
                address: 'อาคาร 7 - ศรีปทุม',
                room: '07-0708',
                teacher: 'ดร.พิชัย สุทธิการ',
            }
        ]
    },
    {
        key: '7',
        name: 'วันเสาร์',
        expandDataSource: [
            {
                key: '7-1',
                date: '09:00-10:40',
                name: 'การวิเคราะห์และออกแบบระบบ',
                group: '007',
                address: 'อาคาร 2 - ศรีปทุม',
                room: '02-0204',
                teacher: 'ดร.อาภาพร ปัญญา',
            },
            {
                key: '7-2',
                date: '14:00-15:40',
                name: 'วิศวกรรมซอฟต์แวร์',
                group: '007',
                address: 'อาคาร 3 - ศรีปทุม',
                room: '03-0302',
                teacher: 'วิชาญ เกียรติวงศ์',
            }
        ]
    }
];


const expandColumns = [
    { title: 'เวลาเรียน', dataIndex: 'date', key: 'date',},
    { title: 'ชื่อวิชา', dataIndex: 'name', key: 'name' },
    { title: 'กลุ่ม', dataIndex: 'group', key: 'group' },
    { title: 'อาคารเรียน', dataIndex: 'address', key: 'address' },
    { title: 'ห้อง', dataIndex: 'room', key: 'room' },
    { title: 'อาจารย์ผู้สอน', dataIndex: 'teacher', key: 'teacher' },
    {
        title: 'สถานะ',
        key: 'state',
        render: () => <Badge status="success" text="เปิดสอน" />,
    },

];

const columns = [
    { title: 'วันที่', dataIndex: 'name', key: 'name', align: 'center', style: { fontWeight: 'bold'} },
    // { title: 'Platform', dataIndex: 'platform', key: 'platform' },
    // { title: 'Version', dataIndex: 'version', key: 'version' },
    // { title: 'Upgraded', dataIndex: 'upgradeNum', key: 'upgradeNum' },
    // { title: 'Creator', dataIndex: 'creator', key: 'creator' },
    // { title: 'Date', dataIndex: 'createdAt', key: 'createdAt' },

];



const App = () => (
    <Table
        columns={columns}
        expandable={{
            expandedRowRender: (record) => (
                <Table
                    columns={expandColumns}
                    dataSource={record.expandDataSource}
                    pagination={false}
                    style={{ width: '100%', overflowX: 'hidden' }}
                />
            ),
            rowExpandable: (record) => record.expandDataSource.length > 0,
        }}
        dataSource={dataSource}
        rowClassName={(record) => `table-row-${record.key}`}
        style={{ width: '100%'}}
        onRow={(record) => ({
            style: { backgroundColor: dayColorMap[record.name] || 'white' },
        })}
    />
);

export default App;