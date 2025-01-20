import React, { useEffect, useState } from 'react';
import { Avatar, Divider, List, Skeleton, Card } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';

const App = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const getRandomRole = () => {
        const roles = ["User", "Admin", "Super Admin"];
        return roles[Math.floor(Math.random() * roles.length)];
    };

    const getRandomLastOnline = () => {
        const now = new Date();
        const randomOffset = Math.floor(Math.random() * (7 * 24 * 60 * 60 * 1000)); // Random offset within the last 7 days
        const lastOnline = new Date(now - randomOffset);

        const day = String(lastOnline.getDate()).padStart(2, '0'); // Ensure two digits for day
        const month = String(lastOnline.getMonth() + 1).padStart(2, '0'); // Add 1 as getMonth() is 0-indexed
        const year = lastOnline.getFullYear(); // Full year

        // Get hours, minutes, seconds and format time in 12-hour AM/PM format
        let hours = lastOnline.getHours();
        const minutes = String(lastOnline.getMinutes()).padStart(2, '0');
        const seconds = String(lastOnline.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12; // Convert to 12-hour format
        hours = hours ? hours : 12; // Handle 0 as 12 for AM/PM format

        // Format the date as dd/mm/yy and time as hh:mm:ss AM/PM
        const formattedDate = `${month}/${day}/${year}`;
        const formattedTime = `${hours}:${minutes}:${seconds} ${ampm}`;

        return `Last online: ${formattedDate}, ${formattedTime}`;
    };




    const loadMoreData = () => {
        if (loading) {
            return;
        }
        setLoading(true);
        fetch('https://randomuser.me/api/?results=10&inc=name,gender,email,nat,picture&noinfo')
            .then((res) => res.json())
            .then((body) => {
                setData([...data, ...body.results]);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        loadMoreData();
    }, []);

    return (
        <Card style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <div
                id="scrollableDiv"
                style={{
                    height: 400,
                    overflowY: 'scroll',
                    padding: '0 16px',
                    border: '1px solid rgba(140, 140, 140, 0.35)',
                    borderColor: 'transparent',
                    borderRadius: '12px', // Rounded border
                    scrollbarWidth: 'none', // Hide scrollbar for Firefox
                    msOverflowStyle: 'none', // Hide scrollbar for IE
                }}
            >
                <style>
                    {`
        #scrollableDiv::-webkit-scrollbar {
          display: none; /* Hide scrollbar for Chrome, Safari, and Opera */
        }
      `}
                </style>
                <InfiniteScroll
                    dataLength={data.length}
                    next={loadMoreData}
                    hasMore={data.length < 50}
                    loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                    endMessage={<Divider plain>Nothing more</Divider>}
                    scrollableTarget="scrollableDiv"
                >
                    <List
                        dataSource={data}
                        renderItem={(item) => (
                            <List.Item key={item.email}>
                                <List.Item.Meta
                                    avatar={<Avatar src={item.picture.large} />}
                                    title={<a href="https://ant.design">{item.name.last}</a>}
                                    description={item.email}
                                />
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold' }}>{getRandomRole()}</div>
                                    <div style={{ fontSize: '12px', color: '#888' }}>
                                        Last online: {getRandomLastOnline()}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </InfiniteScroll>
            </div>
        </Card>
    );
};

export default App;
