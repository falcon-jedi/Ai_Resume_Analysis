'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

export function LandingTestimonials() {
  return (
    <section className="w-full py-14 sm:py-24 md:py-32 bg-[#FFF8F6] relative overflow-hidden">
      {/* Large structural background typography */}
      <div className="absolute top-10 left-[-5%] font-['Playfair_Display'] text-[72px] sm:text-[140px] md:text-[200px] text-[#ffe9e5] opacity-50 whitespace-nowrap pointer-events-none tracking-tighter select-none">
        ENDORSEMENTS
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-16 relative z-10">
        <div className="text-center mb-10 sm:mb-20 flex flex-col items-center">
          <h2 className="font-['Playfair_Display'] text-[26px] sm:text-[36px] md:text-[48px] leading-tight md:leading-[56px] font-bold text-[#370003] mb-3 sm:mb-4">
            Chronicles of Success
          </h2>
          <div className="w-12 h-px bg-[#8a716f]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Testimonial 1 */}
          <div className="bg-[#FFF8EE] p-6 sm:p-8 md:p-10 relative shadow-[0_2px_10px_rgba(78,52,46,0.05)] transform sm:-rotate-1 hover:rotate-0 transition-transform duration-300 border border-[#E5D9C8]">
            <div className="absolute inset-1 border border-[#E5D9C8]/50 pointer-events-none" />
            <IconMapper
              name="format_quote"
              className="text-[#a23c3a] opacity-30 text-3xl sm:text-4xl absolute top-5 sm:top-6 left-5 sm:left-6"
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            <div className="relative z-10 mt-5 sm:mt-6 flex flex-col h-full justify-between">
              <p className="font-['Hanken_Grotesk'] text-sm sm:text-base md:text-lg text-[#2b1611] italic mb-6 sm:mb-8 leading-relaxed">
                &ldquo;JobPatra feels less like software and more like a high-end stationery shop
                equipped with a brilliant career strategist. My response rate doubled.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover grayscale"
                  alt="Marcus T."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG5cFPEsIYuANsiLTeF_0Rwl5OTBDoiOgakemPdo4DpOruimV5YefrxupzFKahKCt6MgPN_AzAt_hv9OeOnUuTm_YjYssHadga5ZLLSaJmlFNTYXspNlrD76MEJ9LvJ8Ldht2a1EiymrtXbTXQzgpmwXi2g0MnIooczZ9AqecUOYksl97Qz9eE1PAL-x7q_qjA06uMUV-_fCCoq0JFdfBGiRGFqFpadGDxf6C_z5RJiQnVStRjDxB7Cw"
                />
                <div className="flex flex-col">
                  <span className="font-['Hanken_Grotesk'] text-xs sm:text-sm font-semibold text-[#2b1611] uppercase tracking-wider">
                    Marcus T.
                  </span>
                  <span className="font-['Hanken_Grotesk'] text-[11px] sm:text-xs text-[#564240]">
                    VP of Operations
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 (Elevated) */}
          <div className="bg-[#FFF8EE] p-6 sm:p-8 md:p-10 relative shadow-[0_8px_30px_rgba(78,52,46,0.08)] transform sm:rotate-2 md:-translate-y-4 hover:rotate-0 transition-transform duration-300 z-20 border border-[#E5D9C8]">
            <div className="absolute inset-1 border border-[#E5D9C8] pointer-events-none" />
            <IconMapper
              name="format_quote"
              className="text-[#370003] opacity-40 text-3xl sm:text-4xl absolute top-5 sm:top-6 left-5 sm:left-6"
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            <div className="relative z-10 mt-5 sm:mt-6 flex flex-col h-full justify-between">
              <p className="font-['Hanken_Grotesk'] text-base md:text-lg text-[#2b1611] italic mb-6 sm:mb-8 leading-relaxed font-normal">
                &ldquo;The ATS analyzer is ruthlessly effective. It highlighted structural flaws
                I&rsquo;d missed for years, formatting my experience into a narrative that simply
                works.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  alt="Elena R."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvL-piYtQkH_Fvu15E-T4fnM-OJKWLX8xgmzpqgWkl-A6A2eCiSOkTePg0m2SRKgG5PMFQMJegK4Zz3jEuuDBo2Y5G-BO4Jhj5umNhIg5-JvpfjXH7VT-tK904FYO8YQFI_xLf5Kpu4el1j_ApbhT7fqChev2c7wl7RD_DSAf7Q1pRbKzenpy5iU23XVUKOTfbU30Y892Ed8pUwWFKQqrqH_jL_g4xmPl2S3jYANLcD4hDlLCdfrMBrw"
                />
                <div className="flex flex-col">
                  <span className="font-['Hanken_Grotesk'] text-xs sm:text-sm font-semibold text-[#2b1611] uppercase tracking-wider">
                    Elena R.
                  </span>
                  <span className="font-['Hanken_Grotesk'] text-[11px] sm:text-xs text-[#564240]">
                    Senior Engineer
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative Pin */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#8a716f] shadow-sm">
              <div className="absolute inset-1 rounded-full bg-[#ffdad3]" />
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-[#FFF8EE] p-6 sm:p-8 md:p-10 relative shadow-[0_2px_10px_rgba(78,52,46,0.05)] transform sm:-rotate-2 hover:rotate-0 transition-transform duration-300 border border-[#E5D9C8]">
            <div className="absolute inset-1 border border-[#E5D9C8]/50 pointer-events-none" />
            <IconMapper
              name="format_quote"
              className="text-[#a23c3a] opacity-30 text-3xl sm:text-4xl absolute top-5 sm:top-6 left-5 sm:left-6"
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            <div className="relative z-10 mt-5 sm:mt-6 flex flex-col h-full justify-between">
              <p className="font-['Hanken_Grotesk'] text-sm sm:text-base md:text-lg text-[#2b1611] italic mb-6 sm:mb-8 leading-relaxed">
                &ldquo;Generating customized cover letters for distinct roles used to take hours.
                The Digital Nib crafts compelling intros in seconds, maintaining my authentic
                voice.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover grayscale"
                  alt="David K."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCT-lHNPvh8rkid6sLIVKH9L0CZvrhs6yuyU_3mocCMYzhMHLiIOKPwqlVS0D5Ix2WoYAp3Lgfb1tnKp7x3D_S4LZYB2N5AfQdvxHACwkjD2INWRkpy5D-fygKWfHFrXHDFFJ5BdHffq4xPESNFRFANduDdGdSYOaBAzws6TMDiTwgyw76Npv1jHOxdChcq4OgT1J50NuiIPxPOXyabvy11P9JKOrZiL0rbTCB_glbuCM12X0_vu1VQw"
                />
                <div className="flex flex-col">
                  <span className="font-['Hanken_Grotesk'] text-xs sm:text-sm font-semibold text-[#2b1611] uppercase tracking-wider">
                    David K.
                  </span>
                  <span className="font-['Hanken_Grotesk'] text-[11px] sm:text-xs text-[#564240]">
                    Creative Director
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
