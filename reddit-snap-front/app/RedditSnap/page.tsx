import LineChart from '@/app/ui/LineChart'
import { fetchData } from '@/app/actions/dev_utility';
import SearchForm from '@/app/ui/Search';


export default async function Page(
  {searchParams,}:
  {
    searchParams?: {
      submission_id?: string;
    }
  }
) {
  const query = searchParams?.submission_id || '1fgua0x' ;
  console.log('query', query);
  const res = await fetchData(query);
  const data = res?.data;
  const title = res?.title;
  return (
    <> 
      <div className='flex-col justify-items-center mt-32'>
        <div className='flex justify-center mb-10'>
          <div className='flex justify-center w-8/12'>
            <h1>/r/WorldNews Post: <strong>{title}</strong></h1>
          </div>
          
        </div>
        <LineChart data={data}/> 
        <div className='flex justify-center mt-10'>
          <SearchForm/>
        </div>
      </div>
    
    </>
    
  );
}

