import LineChart from '@/app/ui/lineChart';
import { fetchById } from '@/app/lib/data';
import { SearchIdForm, SearchTitleForm } from '@/app/ui/search';
import Table from '@/app/ui/table';


export default async function Page(
  {searchParams,}:
  {
    searchParams?: {
      submission_id?: string;
      submission_title?: string;
      page?: number;
      title_query?: string;
    }
  }
) {
  const query = searchParams?.submission_id || '' ;
  const res = await fetchById(query);
  const data = res?.data;
  const title = res?.title;
  const match = res?.match;

  return (
    <> 
      <div className='flex-col justify-items-center mt-8'>
        <div className='flex justify-center mb-10'>
          <div className='w-8/12'>
            <h1>/r/WorldNews Post: </h1>
            <h1><strong>{title}</strong></h1>
            <p>{match ? null : 'Unmatched id; display default.'}</p>
          </div>
          
        </div>
        <LineChart data={data}/> 
        <div className='flex justify-center mt-10'>
          <SearchIdForm/>
        </div>
        <div className='flex justify-center mt-5'>
          <SearchTitleForm/>
        </div>
        <div className='flex justify-center mt-5'>
          <Table query={searchParams?.title_query}/>
        </div>
      </div>
    
    </>
    
  );
}

