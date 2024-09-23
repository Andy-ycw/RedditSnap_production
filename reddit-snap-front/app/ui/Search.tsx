'use client'



export function SearchIdForm() {
    
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

export function SearchTitleForm() {
    
    return (
        <div>
            <form id="myForm">
                <label htmlFor="search"></label>
                <input type="text" name="submission_title" placeholder="Search by title..." />
                <button className="rounded-lg bg-blue-600 px-4 ml-4" type="submit">Submit</button>
            </form>
        </div>
    );
}