import {  GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from "@prismicio/client";

import styles from './post.module.scss';

import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { formatDate } from '../../util/formatDate';
import { useUtterances } from '../../components/Comments';

interface Post {
  uid: string,
  first_publication_date: string | null,
  data: {
    title: string,
    subtitle: string,
    banner: {
      url: string,
    };
    author: string,
    content: {
      heading: string,
      body: {
        text: string,
      }[],
    }[],
  },
}

interface PostProps {
  post: Post;
}

//Contador de segundos de leitura... recebe html em string
function readingRate(length) {
  if(length > 0 ){
    let readingRateInSeconds = 0;
  
    // Quantidade de palavras do texto
    // const wordCount = content.split(" ").length;
    const wordCount = length;
    
    // Processando o tempo de leitura
    readingRateInSeconds = (wordCount*60)/160;
  
    return readingRateInSeconds / 60;
  }
  return 0
}

export default function Post(props: PostProps) {
  const router = useRouter()

  if(router.isFallback){
    return (
      <>      
        <div className={styles.fallback}>
          Carregando...
        </div>
      </>
    )
  }

  const postData = props.post.data

  let reading = 0;
  
  postData.content.forEach(e => {

    var textBody = ' '
    var textHead = e.heading
    
    e.body.forEach(i => {
      textBody += i.text
    })

    var minBody = readingRate(textBody.split(" ").length)
    var minHead = readingRate(textHead.length)
    
    reading = reading + minBody + minHead
        
  })

  const minReading = reading.toFixed(0)

  const date_post = formatDate(props.post.first_publication_date);

  useUtterances('uterrance')

  return (
    <>    
      <Head>
        <title>Post | SpaceTreveling</title>
      </Head>      

      <Header />

      <div className={styles.banner}>
        <img  src={postData.banner.url} alt="banner" />
      </div>
     

      <section className={styles.container}>
        <h1>{postData.title}</h1>
        
        <div className={styles.infos_post}>
          <span><FiCalendar />{ date_post }</span>
          <span><FiUser />{postData.author}</span>
          <span><FiClock />{minReading + ' min'}</span>
        </div>

        { postData.content.map( data => (
              <div key={data.heading} className={styles.content}>
                <h3>{data.heading}</h3>
                <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(data.body) }} className={styles.content_body}></div>
              </div>
            )
          )
        }
       
      </section>
      <div id='uterrance'></div>
    </>
  )
}

export const getStaticPaths = async () => {
  
  const docs = await getPrismicClient().query(
    Prismic.Predicates.at('document.type', 'post'),
    { lang: '*' }
  );
  return {
    paths: docs.results.map((doc) => {
      return { params: { slug: doc.uid }};
    }),
        fallback: false,
    }
}

export const getStaticProps: GetStaticProps = async ({params}) => {
  const { slug } = params;

  const prismic = getPrismicClient();  
    const response = await prismic.getByUID( 'post', String(slug), {});
  
    var content = []; 

    response.data.content.map( conteudos => {
      content.push({
        heading: conteudos.heading,
        body: conteudos.body
      })
    })
    
    const post: Post = {
      uid: response.uid,
      first_publication_date: response.first_publication_date,
      data: {
        title: response.data.title,
        subtitle: response.data.subtitle,
        banner: {
          url: response.data.banner.url,
        },
        author: response.data.author,
        content: content,
      },
    }

  return {
      props: {
          post
      }
  }
};
