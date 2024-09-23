import Dropzone from '@/app/lib/dropzone'

export default function Home(){
  return (
    <main>
      <section className='section'>
        <div className='container'>
          <h1 className='title text-3x1 font-bold flex flex-col items-center text-lg'>Upload Files</h1>
          <Dropzone className='p-16 mt-10 border border-neutral-200' />
        </div>
      </section>
    </main>
  )
}