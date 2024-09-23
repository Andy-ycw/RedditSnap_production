import LineChart from '@/app/ui/LineChart'
import { fetchById } from '@/app/lib/data';
import { SearchIdForm, SearchTitleForm } from '@/app/ui/Search';


export default async function Page(
  {searchParams,}:
  {
    searchParams?: {
      submission_id?: string;
      submission_title?: string;
      page?: number;
      title?: string;
    }
  }
) {
  const query = searchParams?.submission_id || '' ;
  const res = await fetchById(query);
  const data = res?.data;
  const title = res?.title;

  return (
    <> 
      <div className='flex-col justify-items-center mt-8'>
        <div className='flex justify-center mb-10'>
          <div className='flex justify-center w-8/12'>
            <h1>/r/WorldNews Post: <strong>{title}</strong></h1>
          </div>
          
        </div>
        <LineChart data={data}/> 
        <div className='flex justify-center mt-10'>
          <SearchIdForm/>
        </div>
        <div className='flex justify-center mt-5'>
          <SearchTitleForm/>
        </div>
      </div>
    
    </>
    
  );
}

