import { Card, Dropdown } from "flowbite-react";


export const PlayerCard = () => {
  return (
   
    <Card className="w-[140px] h-[280px] m-2">
      {/* <div className="flex justify-end px-0">
        <Dropdown inline label="nincs">
          <Dropdown.Item>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Edit
            </a>
          </Dropdown.Item>
          <Dropdown.Item>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Export Data
            </a>
          </Dropdown.Item>
          <Dropdown.Item>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Delete
            </a>
          </Dropdown.Item>
        </Dropdown>
      </div> */}
      <div className="flex flex-col items-center">
        <img
          alt="Bonnie image"
          height="56"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          width="56"
          className="mb-3 rounded-full shadow-lg"
        />
        <h5 className="mb-1 text-l font-medium text-center text-gray-900 dark:text-white">Novak Djoko</h5>
        <span className="text-sm text-gray-500 dark:text-gray-400">Serve:</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">Forhand:</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">Backhand</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">Volley</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">Agilty</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">Stamina</span>

        <div className="mt-0.5 flex space-x-3 lg:mt-0.5">
          <a
            href="#"
            className="inline-flex items-center rounded-lg bg-cyan-700 px-3 py-1 text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
          >
            Add
          </a>
          <a
            href="#"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
          >
            Play
          </a>
        </div>
      </div>
    </Card>
  );
}
