import { useState } from "react";
import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import { Checkbox } from "antd";
import callApi from "../utils/axios";
import { useNavigate } from "react-router-dom";

export default function PolicyModal({ open }) {
  const navigate = useNavigate();

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [check, setCheck] = useState(false);
  const policyText = `
  <h3>นโยบายความเป็นส่วนตัว (Privacy Policy)</h3>

<ol>
  <li><strong>การเก็บข้อมูลส่วนบุคคล</strong><br>
    เว็บไซต์ของเราจะเก็บข้อมูลส่วนบุคคลของผู้ใช้งานที่จำเป็นเท่านั้น เช่น ชื่อ, อีเมล, เบอร์โทรศัพท์ และข้อมูลการใช้งานอื่น ๆ เมื่อผู้ใช้สมัครใช้งานบริการ หรือทำการติดต่อกับเราผ่านทางเว็บไซต์ ข้อมูลที่เราเก็บจะใช้สำหรับการให้บริการตามวัตถุประสงค์ที่ระบุในข้อกำหนดและเงื่อนไขของเว็บไซต์นี้
  </li>
  <li><strong>การใช้คุกกี้ (Cookies)</strong><br>
    เว็บไซต์อาจใช้คุกกี้เพื่อเก็บข้อมูลการเข้าชมเว็บไซต์ เช่น ชื่อผู้ใช้และการตั้งค่าต่าง ๆ เพื่อปรับปรุงประสบการณ์การใช้งานของผู้ใช้ คุกกี้นี้จะไม่ใช้เพื่อรวบรวมข้อมูลส่วนบุคคลจากผู้ใช้งาน โดยที่ผู้ใช้สามารถตั้งค่าการใช้คุกกี้ได้จากเบราว์เซอร์ของตนเอง
  </li>
  <li><strong>การใช้ข้อมูลส่วนบุคคล</strong><br>
    ข้อมูลส่วนบุคคลที่เราเก็บจะถูกใช้เพื่อการให้บริการต่าง ๆ เช่น การยืนยันตัวตน, การติดต่อ, การให้คำแนะนำ และการปรับปรุงบริการของเรา เราจะไม่ขายหรือเปิดเผยข้อมูลส่วนบุคคลของผู้ใช้ให้กับบุคคลที่สามโดยไม่ได้รับความยินยอมจากผู้ใช้ ยกเว้นในกรณีที่จำเป็นตามกฎหมาย
  </li>
  <li><strong>การรักษาความปลอดภัยของข้อมูล</strong><br>
    เราจะใช้มาตรการรักษาความปลอดภัยที่เหมาะสมในการป้องกันการเข้าถึงหรือการเปิดเผยข้อมูลส่วนบุคคลที่ไม่ได้รับอนุญาต รวมถึงการใช้เทคโนโลยีการเข้ารหัสเพื่อปกป้องข้อมูลที่ส่งผ่านระบบของเรา
  </li>
  <li><strong>สิทธิของผู้ใช้</strong><br>
    ผู้ใช้มีสิทธิ์ในการเข้าถึง, แก้ไข, และลบข้อมูลส่วนบุคคลของตนเองที่เก็บไว้ในระบบของเรา หากผู้ใช้ต้องการใช้สิทธิ์เหล่านี้ สามารถติดต่อทีมงานของเราได้ตามช่องทางที่ระบุไว้ในเว็บไซต์
  </li>
  <li><strong>การยอมรับนโยบาย</strong><br>
    โดยการใช้งานเว็บไซต์นี้ ผู้ใช้ยอมรับว่าคุณได้อ่านและเข้าใจในนโยบายความเป็นส่วนตัวนี้ และยินยอมให้เราประมวลผลข้อมูลส่วนบุคคลของคุณตามที่ได้อธิบายไว้ข้างต้น
  </li>
  <li><strong>การอัปเดตนโยบาย</strong><br>
    เราขอสงวนสิทธิ์ในการปรับปรุงและเปลี่ยนแปลงนโยบายความเป็นส่วนตัวนี้โดยไม่ต้องแจ้งให้ทราบล่วงหน้า การเปลี่ยนแปลงจะมีผลทันทีเมื่ออัปโหลดขึ้นบนเว็บไซต์นี้ ผู้ใช้ควรตรวจสอบนโยบายความเป็นส่วนตัวเป็นระยะ ๆ เพื่อรับทราบการเปลี่ยนแปลงที่อาจเกิดขึ้น
  </li>
</ol>

`;
  const submitPolicy = async () => {
    setConfirmLoading(true);
    try {
      const response = await callApi({
        path: "/auth/accept_policy",
        method: "POST",
        value: { acceptPolicy: check },
      });

      if (response.status === "success") {
        navigate("/otp");
      }
    } catch (error) {
      console.log("Error :", error);
      setConfirmLoading(false);
    }
  };
  return (
    <>
      <Modal
        title="ยอมรับ Policy"
        open={open}
        confirmLoading={confirmLoading}
        maskClosable={false}
        closable={false}
        footer={null}
        width={600}
      >
        <div
          className="bg-white shadow-md p-4 border border-darkGray my-3 rounded-md"
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
          }}
          dangerouslySetInnerHTML={{ __html: policyText }}
        />
        <span className=" opacity-85 ">
          กรุณากดยอมรับเพื่อยืนยันว่าคุณเข้าใจและยินยอมตามเงื่อนไขที่ระบุในนโยบายความเป็นส่วนตัวนี้
        </span>
        <Checkbox
          value={check}
          onChange={() => setCheck(!check)}
          className="flex items-start justify-start"
        >
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
