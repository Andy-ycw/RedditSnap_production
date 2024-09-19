'use client'



export default function SearchForm() {
    
    return (
        <div>
            <form id="myForm">
            <label htmlFor="search"></label>
            <input type="text" name="submission_id" placeholder="Search by post id..." />
            <button className="rounded-lg bg-blue-600 px-4 ml-4" type="submit">Submit</button>
            </form>
        </div>
    );
}