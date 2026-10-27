const focusableSelector = 'button, input, select, textarea, a[href], [tabindex="0"]';

export function activateDialog(dialog) {
  if (!dialog) return;
  const previous = document.activeElement;
  const onKeyDown = event => {
    if (event.key !== 'Tab') return;
    const candidates = [...dialog.querySelectorAll(focusableSelector)]
      .filter(element => !element.matches(':disabled') && !element.closest('[hidden], [inert]'));
    if (!candidates.length) { event.preventDefault(); dialog.focus(); return; }
    const first = candidates[0], last = candidates.at(-1);
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !candidates.includes(active))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (active === last || !candidates.includes(active))) {
      event.preventDefault(); first.focus();
    }
  };
  dialog.addEventListener('keydown', onKeyDown);
  dialog.focus();
  return () => {
    dialog.removeEventListener('keydown', onKeyDown);
    if (previous?.isConnected) previous.focus();
  };
}
