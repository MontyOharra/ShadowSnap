export default function Button({ children }) {
  function handleClick() {
    alert('clicked')
    console.log('clicked')
  }

  return (
    <button className="button" onClick={handleClick}>
      {children}
      And also this is custom
    </button>
  )
}