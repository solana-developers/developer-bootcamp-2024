"use client";

import Link from "next/link";
import * as React from "react";
import { ReactNode, Suspense, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

import { AccountChecker } from "../account/account-ui";
import { ClusterChecker, ExplorerLink } from "../cluster/cluster-ui";
import { TiThMenu } from "react-icons/ti";
import NavbarLinkList from "./navbar-link-list";

export function UiLayout({
  children,
  links,
  companyLinks,
  employeeLinks,
}: {
  children: ReactNode;
  links: { label: string; path: string }[];
  companyLinks: { label: string; path: string }[];
  employeeLinks: { label: string; path: string }[];
}) {
  const [showMenu, setShowMenu] = React.useState<boolean>(false);
  return (
    <div className="h-full flex flex-col ">
      <div className="navbar bg-base-300 text-neutral-content flex-col md:flex-row space-y-2 md:space-y-0">
        <div className="flex justify-between w-full md:justify-normal md:flex-1">
          <Link className="btn btn-ghost normal-case text-xl" href="/">
            <img className="h-8" alt="Logo" src="/logo.png" />
          </Link>
          <div
            onClick={() => setShowMenu((prev) => !prev)}
            className="md:hidden"
          >
            <TiThMenu className="" />
          </div>

          <NavbarLinkList
            links={links}
            companyLinks={companyLinks}
            employeeLinks={employeeLinks}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
          />
        </div>
      </div>
      <ClusterChecker>
        <AccountChecker />
      </ClusterChecker>
      <div className="flex-grow mx-4 lg:mx-auto">
        <Suspense
          fallback={
            <div className="text-center my-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster position="bottom-right" />
      </div>
      <footer className="footer footer-center p-2 md:p-4 bg-base-300 text-xs md:text-base-content">
        <aside>
          <p>
            Created by{" "}
            <a
              className="link hover:text-white"
              href="https://github.com/kavit-patel"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kavit Patel @ https://github.com/kavit-patel
            </a>
          </p>
        </aside>
      </footer>
    </div>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || "Save"}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <div className="md:w-screen">
          {typeof title === "string" ? (
            <h1 className="text-5xl font-bold">{title}</h1>
          ) : (
            title
          )}
          {typeof subtitle === "string" ? (
            <p className="py-6">{subtitle}</p>
          ) : (
            subtitle
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function ellipsify(str = "", len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + ".." + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={"text-center"}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={"View Transaction"}
          className="btn btn-xs btn-primary"
        />
      </div>
    );
  };
}
