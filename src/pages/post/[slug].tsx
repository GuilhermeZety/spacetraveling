import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import Prismic from '@prismicio/client'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';

format(
	new Date(),
	"'Hoje é' eeee",
	{
		locale: ptBR,
	}
)


interface Post {
  first_publication_date: string | null,
  data: {
    title: string,
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
function readingRate(content) {
  let readingRateInSeconds = 0;

  // Quantidade de palavras do texto
  const wordCount = content.split(" ").length;
  // Processando o tempo de leitura
  readingRateInSeconds = (wordCount*60)/200;

  return readingRateInSeconds / 60;
}

export default function Post(props: PostProps) {
  const postData = props.post.data

  let min_reading = 0;

  postData.content.forEach(e => {
    min_reading += readingRate(e.body)
  })

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
          <span><FiCalendar />{ props.post.first_publication_date }</span>
          <span><FiUser />{postData.author}</span>
          <span><FiClock />{`${min_reading.toFixed(0)} min`}</span>
        </div>

        { postData.content.map( data => (
              <div key={data.heading} className={styles.content}>
                <h3>{data.heading}</h3>
                <div dangerouslySetInnerHTML={{ __html: data.body.toString() }} className={styles.content_body}></div>
              </div>
            )
          )
        }
       
      </section>

    </>
  )
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({params}) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  
    const response = await prismic.getByUID( 'post', String(slug), {});
  
    var content = []; 

    console.log(response.data)  

    response.data.content.map( conteudos => {
      content.push({
        heading: conteudos.heading,
        body: RichText.asHtml(conteudos.body)
      })
    })
    
    const post: Post = {
      first_publication_date: new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',    
      }),
      data: {
        title: response.data.title,
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
