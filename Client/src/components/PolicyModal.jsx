import { useState } from "react";
import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import { Checkbox } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PolicyModal({ open, submitModal }) {
  const URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [check, setCheck] = useState(false);

  const submitPolicy = async () => {
    setConfirmLoading(true);
    try {
      const response = await axios.post(
        `${URL}/auth/accept_policy`,
        { acceptPolicy: check },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setConfirmLoading(false);
        submitModal();
      }
    } catch (error) {
      console.log("Error :", error);
    }
  };
  return (
    <>
      <Modal
        title="ยอมรับ Policy"
        open={open}
        // onOk={handleOk}
        confirmLoading={confirmLoading}
        // onCancel={handleCancel}
        maskClosable={false}
        closable={false}
        footer={null}
      >
        <Checkbox value={check} onChange={() => setCheck(!check)}>
          ยอมรับ
        </Checkbox>
        <div className="flex items-center justify-center gap-5">
          <Button
            color="danger"
            variant="solid"
            size="large"
            onClick={() => navigate("/")}
          >
            ยกเลิก
          </Button>
          <Button
            color="primary"
            variant="solid"
            size="large"
            loading={confirmLoading}
            onClick={submitPolicy}
          >
            ตกลง
          </Button>
        </div>
      </Modal>
    </>
  );
}
PolicyModal.propTypes = {
  open: PropTypes.bool,
  submitModal: PropTypes.func,
};
