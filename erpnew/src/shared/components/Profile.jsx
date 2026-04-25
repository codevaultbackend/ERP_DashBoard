"use client";

import { Pencil, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../Component/DashboardLayout";

export default function Profile() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen bg-[#F6F8FA] px-4 sm:px-3 py-6">

        <div className="max-w-[1200px] mx-auto">

          {/* TITLE */}
          <h2 className="text-[20px] font-[500] text-black mb-8">
            My Profile
          </h2>

          {/* PROFILE IMAGE */}
          <div className="relative w-[124px] h-[124px] mx-auto sm:mx-0 mb-12">

            <img
              src="https://i.pravatar.cc/300?img=12"
              alt="profile"
              className="w-full h-full rounded-full object-cover"
            />

            <button
              className="
                absolute bottom-2 right-2
                w-[40px] h-[40px]
                rounded-full
                bg-white
                shadow-md
                flex items-center justify-center
                border border-[#E5E7EB]
              "
            >
              <Pencil className="w-5 h-5 text-black" />
            </button>

          </div>

          {/* FORM */}
          <div className="space-y-7">

            {/* NAME */}
            <div>
              <label className="text-[16px] font-medium text-black block mb-3">
                Full Name
              </label>

              <input
                type="text"
                defaultValue={user?.name || ""}
                className="
                  w-full
                  h-[48px]
                  rounded-[18px]
                  px-5
                  bg-white
                  border border-[#E5E7EB]
                  shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                  text-[16px]
                  outline-none
                "
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-[16px] font-medium text-black block mb-3">
                Email ID
              </label>

              <input
                type="email"
                defaultValue={user?.email || ""}
                className="
                  w-full
                  h-[48px]
                  rounded-[18px]
                  px-5
                  bg-white
                  border border-[#E5E7EB]
                  shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                  text-[16px]
                  outline-none
                "
              />
            </div>

            {/* PASSWORD CARD */}
            <div
              className="
                w-full
                h-[82px]
                rounded-[18px]
                bg-white
                border border-[#E5E7EB]
                shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                px-5
                flex items-center justify-between
              "
            >

              <div className="flex items-center gap-4">

                <div className="text-[16px] font-[500]">**|</div>

                <div>
                  <p className="text-[16px] font-medium text-black">
                    Change Password
                  </p>

                  <span className="text-[12px] text-gray-400">
                    Last Change 27 Jan. 2026
                  </span>
                </div>

              </div>

              <ArrowRight className="w-7 h-7 text-black" />

            </div>

          </div>

          {/* SAVE BUTTON */}
          <div className="mt-10">

            <button
              className="
                bg-[#0D4CBA]
                text-white
                h-[48px]
                w-full sm:w-[230px]
                rounded-[16px]
                text-[16px]
                font-medium
                shadow-[0_6px_14px_rgba(13,76,186,0.35)]
                hover:bg-[#0b42a0]
                transition
              "
            >
              Save Changes
            </button>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}