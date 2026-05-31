import './Toggle.css';

function Toggle({ checked, id, label, onChange }) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={`toggle ${checked ? 'toggle--on' : 'toggle--off'}`}
      id={id}
      onClick={onChange}
      role="switch"
      type="button"
    >
      <span className="toggle__thumb" />
      <span className="toggle__text">{checked ? 'On' : 'Off'}</span>
    </button>
  );
}

export default Toggle;
