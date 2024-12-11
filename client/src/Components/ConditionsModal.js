import React from 'react'
import "./ConditionsModal.css"

const ConditionsModal = ({ conditionModal, setConditionModal }) => {
    return (
        <div className={`${conditionModal ? "conditionModal" : "hideConditionModal"}`}>
            <div className='conditions'>
                <div className='conditionsHeader'>
                    <h3>Membership Terms & Conditions</h3>
                    <i onClick={() => setConditionModal(false)} className="ri-close-circle-line"></i>
                </div>
                <div className="conditionInner">
                    <h4>Acknowledgment of Risks, Injury & Obligations</h4>
                    <ul>
                        <li>
                            I understand that participating in gym activities involves certain risks. I acknowledge that:
                            <ul className='conditionInnerList'>
                                <li>Gym activities may result in physical or mental injury, and in extreme cases, death.</li>
                                <li>Personal belongings may be lost or damaged.</li>
                                <li>Other participants may unintentionally cause injury to me or damage to my property.</li>
                                <li>I may also unintentionally injure others or damage their property.</li>
                                <li>Conditions during gym activities may vary, sometimes without warning.</li>

                            </ul>
                        </li>
                        <li>I accept the risk of potential injury, death, or property damage as a result of gym activities or the negligence of the gym.</li>
                        <li>I recognize that there may be limited or no treatment or emergency transport facilities in the event of injury.</li>
                    </ul>
                    <h4>Release and Indemnity</h4>
                    <ul>
                        <li>I participate in gym activities at my own risk.</li>
                        <li>I release, indemnify, and hold harmless the gym, its staff, and agents from all claims, actions, or demands made by me, on my behalf, or by others, related to any injury, loss, damage, or death resulting from my participation in gym activities. This includes incidents caused by negligence, breach of contract, or any other cause.</li>
                    </ul>
                    <h4>Administration</h4>
                    <ul>
                        <li>Proper gym attire, including covered footwear and a shirt, must be worn at all times within the gym facility.</li>
                        <li>Memberships are non-refundable and non-transferable.</li>
                        <li>All weights and equipment must be returned to their designated places after use.</li>
                        <li>A valid photo ID (e.g., Student Card, Driver’s License, Aadhaar Card, PAN Card, Voter ID) must be carried and presented upon request.</li>
                        <li>Sharing gym access with a non-member will result in immediate membership termination.</li>
                        <li>Members are expected to respect other gym users and maintain appropriate behavior at all times.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default ConditionsModal
