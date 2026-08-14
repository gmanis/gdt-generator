import { AppRefs } from "./refs";

// ─── Toast / loading overlay helpers ──────────────────────────────────────────
// Shared by main.ts and generate.ts so both give feedback the same way instead
// of mixing this toast system with native alert()/confirm() dialogs.

export function showToast(refs: AppRefs, msg: string): void {
  refs.toastText.textContent = msg;
  refs.toast.classList.add("show");
  setTimeout(() => refs.toast.classList.remove("show"), 3000);
}

export function showLoading(refs: AppRefs, text: string): void {
  refs.loadingText.textContent = text;
  refs.loadingOverlay.style.display = "flex";
}

export function hideLoading(refs: AppRefs): void {
  refs.loadingOverlay.style.display = "none";
}

export const openModal  = (el: HTMLElement) => { el.style.display = "flex"; };
export const closeModal = (el: HTMLElement) => { el.style.display = "none"; };
