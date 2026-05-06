"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useIsStandalonePwa, useScrollThreshold, useLockBodyScroll } from "@/hooks";
import Button from "@/components/ui/Button";
import Image from "next/image";

const NAV_LINKS = [
  { name: "Fitur", href: "/#fitur" },
  { name: "Tentang", href: "/#tentang" },
  { name: "Alur", href: "/#alur" },
  { name: "Keamanan", href: "/#keamanan" },
  { name: "Kontak", href: "/#kontak" },
] as const;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isStandalonePwa = useIsStandalonePwa();
  const isScrolled = useScrollThreshold(20);

  useLockBodyScroll(isMenuOpen);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-[10000] transition-[background-color,box-shadow,backdrop-filter] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] px-4 lg:px-[84px] ${isStandalonePwa ? "hidden lg:block" : ""} ${isScrolled
          ? "h-[72px] bg-white/85 backdrop-blur-[20px] shadow-[0_8px_26px_rgba(15,23,42,0.06)]"
          : "h-[72px] lg:h-[90px] bg-bg"
          }`}
        aria-label="Navigasi utama"
      >
        <div className="max-w-[1440px] mx-auto h-full flex justify-between items-center relative w-full">
          <Link
            className="font-display text-2xl font-extrabold tracking-[-0.02em] text-text-main"
            href="/"
            aria-label="Jivara home"
          >
            <Image
              src="/images/logo/notext.png"
              alt="Jiva - maskot Jivara"
              width={100}
              height={100}
              sizes="100px"
              className="w-full h-auto drop-shadow-2xl"
            />
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-8 xl:gap-10">
              {NAV_LINKS.map((link) => (
                <motion.div
                  key={link.name}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Link
                    href={link.href}
                    className="group w-fit text-sm font-medium tracking-[0.16em] uppercase text-text-main relative transition-colors duration-200 hover:text-primary"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="hidden lg:block">
              <Link href="/login">
                <Button size="lg" icon={<LogIn size={18} />}>
                  Masuk
                </Button>
              </Link>
            </div>

            <button
              className="lg:hidden p-2 text-text-main hover:bg-surface rounded-full transition-colors z-[10001] relative"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMenuOpen}
            >
              <div className="w-5 h-[14px] relative">
                <span
                  className={`h-0.5 w-5 bg-current rounded-full absolute top-0 left-0 transition-transform duration-300 ease-out ${
                    isMenuOpen ? "translate-y-[6px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`h-0.5 w-4 bg-current rounded-full absolute top-[6px] right-0 transition-opacity duration-300 ease-out ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`h-0.5 w-5 bg-current rounded-full absolute top-[12px] left-0 transition-transform duration-300 ease-out ${
                    isMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              className="absolute top-0 right-0 bottom-0 w-[280px] bg-bg shadow-2xl p-6 flex flex-col sm:w-[320px]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <div className="flex items-center mb-4">
                <Image
                  src="/images/logo/notext.png"
                  alt="Jivara"
                  width={132}
                  height={42}
                  sizes="118px"
                  className="h-auto w-[118px]"
                />
              </div>

              <div className="flex flex-col gap-7">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.1 + i * 0.08,
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                  >
                    <motion.div
                      whileHover={{ x: 8, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="group w-fit text-xs font-medium tracking-[0.16em] uppercase text-text-main relative transition-colors duration-200 hover:text-primary"
                      >
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                      </Link>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 25 }}
              >
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full" size="lg" icon={<LogIn size={18} />}>
                    Masuk
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
