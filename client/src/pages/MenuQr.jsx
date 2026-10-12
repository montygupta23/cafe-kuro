import React from 'react'
import { Download, Link, Printer, QrCode, UtensilsCrossed } from "lucide-react";

const MenuQr = () => {
  return (
   <section className="space-y-6">
      <header className="border-b border-[#F97316] pb-5">
        <h2 className="font-serif text-3xl text-black font-bold">Menu QR</h2>
        <p className="mt-1 text-xs text-[#1F2937]">
          Let guests scan the digital menu from their phone in seconds.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card2 shadows rounded-3xl p-6 text-center">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F97316]/10 text-[#F97316]">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6B7280]">
                  Digital menu
                </p>
                <h3 className="font-serif text-2xl text-[#1F2937]">Cafe Kuro</h3>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
            <div className="rounded-[2rem] border border-[#F4E6D8] bg-white p-4 shadows">
            <img src="/menuqr.png" alt="" className='w-full h-full'/>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6B7280]">
                  Quick access
                </p>
                <h4 className="mt-2 font-serif text-3xl text-[#1F2937]">
                  Scan to view our menu
                </h4>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] p-4 space-y-3 text-sm text-[#1F2937]">
                <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
                  <span className="text-[#6B7280]">Restaurant</span>
                  <span className="font-semibold">Cafe Kuro</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
                  <span className="text-[#6B7280]">Location</span>
                  <span className="font-semibold">Bristol Street</span>
                </div>
            
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MenuQr
