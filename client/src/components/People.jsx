import React from 'react'
import Client from "./Client"
import { useSelector } from 'react-redux'
import modes from '../util/Mode'

const People = ({ isPeople }) => {
    const mode = useSelector((state) => state.mode)
    let people = ["Vishal", "Kunal", "Shubham", "Sonny"]
    return (
        <div className={`w-72 bg-[#1c1e29] flex flex-col gap-10 p-8 absolute z-20 left-[77px] h-screen -translate-x-[130%] ${isPeople ? "translate-x-[0%] duration-300 ease-in-out" : "-translate-x-[130%] duration-300 ease-in-out"}`}>
            {
                people.map((el) => (
                    <Client people={el} />
                ))
            }
        </div>
    )
}

export default People