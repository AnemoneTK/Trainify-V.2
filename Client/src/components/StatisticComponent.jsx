import React, { useState, useEffect } from 'react';
import { Col, Row, Statistic, Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'; // Import correct icons

// Fetching mock data for min and max values (replace this with actual API call)
const fetchMinMaxValues = async () => {
    // Mock API call, replace with real data fetching
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                activeUser: {
                    minValue: 10,
                    maxValue: 500
                },
                activeAdmin: {
                    minValue: 1,
                    maxValue: 30
                },
                activeSuperAdmin: {
                    minValue: 1,
                    maxValue: 10
                }
            });
        }, 1000); // Simulating API delay
    });
};

const RandomStatistic = ({ title, minValue, maxValue }) => {
    const [value, setValue] = useState(Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue);
    const [previousValue, setPreviousValue] = useState(value);
    const [color, setColor] = useState("#bababa");
    const [arrow, setArrow] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            // Random change between 1 and 5
            const change = Math.floor(Math.random() * 5) + 1; 
            const direction = Math.random() > 0.5 ? 1 : -1;   
            const newValue = value + (change * direction); 

        
            if (newValue < minValue) {
                setValue(minValue);
            } else if (newValue > maxValue) {
                setValue(maxValue);
            } else {
                setValue(newValue);
            }

        
            if (newValue > previousValue) {
                setColor("green");
                setArrow(<ArrowUpOutlined style={{ marginRight: 8, color: "green" }} />);
            } else if (newValue < previousValue) {
                setColor("red");
                setArrow(<ArrowDownOutlined style={{ marginRight: 8, color: "red" }} />);
            } else {
                setColor("#bababa");
                setArrow(null);
            }


            setPreviousValue(newValue);
        }, 3000); 

        return () => clearInterval(interval);
    }, [value, previousValue, minValue, maxValue]); 

    return (
        <Card bordered={false}>
            <div>
                <span style={{ fontWeight: 'bold', textAlign: 'left', fontSize: '16px' }}>{title}</span>
                <Statistic
                    style={{
                        textAlign: "right",
                        color: color,
                    }}
                    value={value}
                    prefix={arrow}
                />
            </div>
        </Card>
    );
};

const App = () => {
    const [stats, setStats] = useState({
        activeUser: null,
        activeAdmin: null,
        activeSuperAdmin: null
    });

    useEffect(() => {
        const getMinMaxValues = async () => {
            const data = await fetchMinMaxValues(); 
            setStats({
                activeUser: data.activeUser,
                activeAdmin: data.activeAdmin,
                activeSuperAdmin: data.activeSuperAdmin
            });
        };

        getMinMaxValues();
    }, []);


    if (!stats.activeUser || !stats.activeAdmin || !stats.activeSuperAdmin) {
        return <div>Loading...</div>;
    }

    return (
        <Row gutter={16}>
            <Col span={8}>
                <RandomStatistic title="Active User" minValue={stats.activeUser.minValue} maxValue={stats.activeUser.maxValue} />
            </Col>
            <Col span={8}>
                <RandomStatistic title="Active Admin" minValue={stats.activeAdmin.minValue} maxValue={stats.activeAdmin.maxValue} />
            </Col>
            <Col span={8}>
                <RandomStatistic title="Active Super Admin" minValue={stats.activeSuperAdmin.minValue} maxValue={stats.activeSuperAdmin.maxValue} />
            </Col>
        </Row>
    );
};

export default App;
