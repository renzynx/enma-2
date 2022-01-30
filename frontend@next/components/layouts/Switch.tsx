import { useEffect, useState } from "react"
import { Switch } from "@headlessui/react"

export const Switcher = () => {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const root = document.querySelector("html")
    enabled ? root?.classList.add("dark") : root?.classList.remove("dark")
  }, [enabled])

  return (
    <div className="py-16 mr-6 flex-row flex gap-5 dark:text-gray-100 text-gray-100">
      <p>Light</p>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`${enabled ? "bg-indigo-500" : "bg-gray-500"}
          relative inline-flex flex-shrink-0 h-[27px] w-[52px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-300 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${enabled ? "translate-x-[25.5px]" : "translate-x-0"}
            pointer-events-none inline-block h-[24px] w-[24px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
        />
      </Switch>
      <p>Dark</p>
    </div>
  )
}
